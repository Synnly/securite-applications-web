import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserModule } from '../../src/user/user.module';
import { CreateUserDto } from '../../src/user/dto/createUser.dto';
import { Role } from '../../src/common/roles/roles.enum';
import { AuthGuard } from '../../src/auth/auth.guard';
import { RolesGuard } from '../../src/common/roles/roles.guard';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../src/user/user.schema';
import * as bcrypt from 'bcrypt';

describe('UserModule (Integration)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let userModel: Model<UserDocument>;

    const validUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        role: Role.ADMIN,
    };

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [MongooseModule.forRoot(uri), UserModule],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication();

        userModel = moduleFixture.get<Model<UserDocument>>(
            getModelToken(User.name),
        );

        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await mongod.stop();
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    describe('POST /user', () => {
        it('should create a user successfully', async () => {
            await request(app.getHttpServer())
                .post('/user')
                .send(validUserDto)
                .expect(201);

            const createdUser = await userModel.findOne({
                email: validUserDto.email,
            });
            expect(createdUser).toBeDefined();
            expect(createdUser!.email).toEqual(validUserDto.email);
            expect(createdUser!.role).toEqual(validUserDto.role);

            expect(createdUser!.password).not.toEqual(validUserDto.password);
            const isMatch = await bcrypt.compare(
                validUserDto.password,
                createdUser!.password,
            );
            expect(isMatch).toBe(true);
        });

        it('should return 409 Conflict if email already exists', async () => {
            await userModel.create(validUserDto);

            const response = await request(app.getHttpServer())
                .post('/user')
                .send(validUserDto)
                .expect(409);

            expect(response.body.message).toContain('already exists');
        });

        it('should return 400 Bad Request if validation fails (empty email)', async () => {
            const invalidDto = { ...validUserDto, email: '' };

            await request(app.getHttpServer())
                .post('/user')
                .send(invalidDto)
                .expect(400);
        });
    });

    describe('GET /user', () => {
        it('should return an empty array if no users exist', async () => {
            const response = await request(app.getHttpServer())
                .get('/user')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it('should return an array of users excluding sensitive data', async () => {
            const user = new userModel(validUserDto);
            await user.save();

            const response = await request(app.getHttpServer())
                .get('/user')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);

            const returnedUser = response.body[0];
            expect(returnedUser.email).toEqual(validUserDto.email);
            expect(returnedUser.password).toBeUndefined();
        });

        it('should exclude soft-deleted users', async () => {
            await userModel.collection.insertOne({
                email: 'deleted@test.com',
                password: 'hash',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: new Date(),
            } as any);

            await userModel.create(validUserDto);

            const response = await request(app.getHttpServer())
                .get('/user')
                .expect(200);

            expect(response.body.length).toBe(1);
            expect(response.body[0].email).toEqual(validUserDto.email);
        });
    });

    describe('GET /user/:userId', () => {
        it('should return a user by ID without sensitive data', async () => {
            const user = await new userModel(validUserDto).save();
            const id = user._id.toString();

            const response = await request(app.getHttpServer())
                .get(`/user/${id}`)
                .expect(200);

            expect(response.body.email).toEqual(validUserDto.email);
            expect(response.body.password).toBeUndefined();
            expect(response.body._id).toEqual(id);
        });

        it('should return 404 if user not found', async () => {
            const fakeId = new Types.ObjectId().toString();
            await request(app.getHttpServer())
                .get(`/user/${fakeId}`)
                .expect(404);
        });

        it('should return 400 if user ID is invalid', async () => {
            await request(app.getHttpServer())
                .get('/user/invalid-id-format')
                .expect(400);
        });

        it('should return 404 for soft-deleted user', async () => {
            const result = await userModel.collection.insertOne({
                email: 'deleted-one@test.com',
                password: 'hash',
                role: Role.USER,
                deletedAt: new Date(),
            } as any);
            const id = result.insertedId.toString();

            await request(app.getHttpServer()).get(`/user/${id}`).expect(404);
        });
    });

    describe('PUT /user/:userId/ban', () => {
        it('should ban a user successfully', async () => {
            const user = await new userModel(validUserDto).save();
            const id = user._id.toString();

            const response = await request(app.getHttpServer())
                .put(`/user/${id}/ban`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Vérifier que l'utilisateur a bien été banni (bannedAt est défini)
            const bannedUser = await userModel.findById(id);
            expect(bannedUser).toBeDefined();
            expect(bannedUser!.bannedAt).toBeDefined();
            expect(bannedUser!.bannedAt).toBeInstanceOf(Date);
        });

        it('should return 404 if user to ban does not exist', async () => {
            const fakeId = new Types.ObjectId().toString();

            await request(app.getHttpServer())
                .put(`/user/${fakeId}/ban`)
                .expect(404);
        });

        it('should return 400 if user ID is invalid', async () => {
            await request(app.getHttpServer())
                .put('/user/invalid-id-format/ban')
                .expect(400);
        });

        it('should include banned user in GET /user list with bannedAt field', async () => {
            const user1 = await new userModel(validUserDto).save();
            await new userModel({
                ...validUserDto,
                email: 'user2@example.com',
            }).save();

            // Bannir le premier utilisateur
            await request(app.getHttpServer())
                .put(`/user/${user1._id.toString()}/ban`)
                .expect(200);

            // Vérifier que les deux utilisateurs sont retournés
            const response = await request(app.getHttpServer())
                .get('/user')
                .expect(200);

            expect(response.body.length).toBe(2);
            // Trouver l'utilisateur banni dans la réponse
            const bannedUserInList = response.body.find(
                (u: any) => u.email === validUserDto.email,
            );
            expect(bannedUserInList).toBeDefined();
            expect(bannedUserInList.bannedAt).toBeDefined();
        });

        it('should still retrieve banned user from GET /user/:userId', async () => {
            const user = await new userModel(validUserDto).save();
            const id = user._id.toString();

            // Bannir l'utilisateur
            await request(app.getHttpServer())
                .put(`/user/${id}/ban`)
                .expect(200);

            // Récupérer l'utilisateur banni - devrait réussir
            const response = await request(app.getHttpServer())
                .get(`/user/${id}`)
                .expect(200);

            expect(response.body).toBeDefined();
            expect(response.body.email).toEqual(validUserDto.email);
            expect(response.body.bannedAt).toBeDefined();
        });

        it('should allow banning an already banned user (idempotent)', async () => {
            const user = await new userModel(validUserDto).save();
            const id = user._id.toString();

            // Premier bannissement
            const firstBan = await request(app.getHttpServer())
                .put(`/user/${id}/ban`)
                .expect(200);
            expect(firstBan.body.success).toBe(true);

            // Deuxième bannissement - MongoDB updateOne retourne modifiedCount 1 même si déjà banni
            const secondBan = await request(app.getHttpServer())
                .put(`/user/${id}/ban`)
                .expect(200);
            expect(secondBan.body.success).toBe(true);
        });
    });

    describe('PUT /user/:userId/unban', () => {
        it('should unban a banned user successfully', async () => {
            const user = await new userModel({
                ...validUserDto,
                bannedAt: new Date(),
            }).save();
            const id = user._id.toString();

            const response = await request(app.getHttpServer())
                .put(`/user/${id}/unban`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Vérifier que l'utilisateur n'est plus banni (bannedAt a été supprimé)
            const unbannedUser = await userModel.findById(id);
            expect(unbannedUser).toBeDefined();
            expect(unbannedUser!.bannedAt).toBeUndefined();
        });

        it('should return 404 if user to unban does not exist', async () => {
            const fakeId = new Types.ObjectId().toString();

            await request(app.getHttpServer())
                .put(`/user/${fakeId}/unban`)
                .expect(404);
        });

        it('should return 400 if user ID is invalid', async () => {
            await request(app.getHttpServer())
                .put('/user/invalid-id-format/unban')
                .expect(400);
        });

        it('should allow unbanning a user that is not banned (idempotent)', async () => {
            const user = await new userModel(validUserDto).save();
            const id = user._id.toString();

            // Dé-bannir un utilisateur qui n'est pas banni
            const response = await request(app.getHttpServer())
                .put(`/user/${id}/unban`)
                .expect(200);

            // MongoDB $unset retourne modifiedCount 1 même si le champ n'existe pas
            expect(response.body.success).toBe(true);
        });

        it('should allow user to be banned again after being unbanned', async () => {
            const user = await new userModel({
                ...validUserDto,
                bannedAt: new Date(),
            }).save();
            const id = user._id.toString();

            // Dé-bannir l'utilisateur
            await request(app.getHttpServer())
                .put(`/user/${id}/unban`)
                .expect(200);

            // Bannir à nouveau l'utilisateur
            const response = await request(app.getHttpServer())
                .put(`/user/${id}/ban`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Vérifier que l'utilisateur est à nouveau banni
            const rebannedUser = await userModel.findById(id);
            expect(rebannedUser).toBeDefined();
            expect(rebannedUser!.bannedAt).toBeDefined();
            expect(rebannedUser!.bannedAt).toBeInstanceOf(Date);
        });
    });
});
