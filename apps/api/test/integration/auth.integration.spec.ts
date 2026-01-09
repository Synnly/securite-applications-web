import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthModule } from '../../src/auth/auth.module';
import { UserModule } from '../../src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../src/user/user.schema';
import {
    RefreshToken,
    RefreshTokenDocument,
} from '../../src/auth/refreshToken.schema';
import { Role } from '../../src/common/roles/roles.enum';
import { LoginDto } from '../../src/user/dto/login.dto';
import * as bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';

describe('AuthModule (Integration)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let userModel: Model<UserDocument>;
    let refreshTokenModel: Model<RefreshTokenDocument>;

    const mockEmail = 'test@example.com';
    const mockPassword = 'Password123!';
    let validUser: UserDocument;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri),
                ConfigModule.forRoot({
                    isGlobal: true,
                    ignoreEnvFile: true,
                    load: [
                        () => ({
                            ACCESS_TOKEN_SECRET: 'test_access_secret',
                            ACCESS_TOKEN_LIFESPAN_MINUTES: '5',
                            REFRESH_TOKEN_SECRET: 'test_refresh_secret',
                            REFRESH_TOKEN_LIFESPAN_MINUTES: '60',
                        }),
                    ],
                }),
                UserModule,
                AuthModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());

        userModel = moduleFixture.get<Model<UserDocument>>(
            getModelToken(User.name),
        );
        refreshTokenModel = moduleFixture.get<Model<RefreshTokenDocument>>(
            getModelToken(RefreshToken.name),
        );

        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await mongod.stop();
    });

    afterEach(async () => {
        await userModel.deleteMany({});
        await refreshTokenModel.deleteMany({});
    });

    const createMockUser = async () => {
        validUser = await userModel.create({
            email: mockEmail,
            password: mockPassword,
            role: Role.USER,
        });
    };

    describe('POST /auth/login', () => {
        it('should login successfully and return access token + refresh cookie', async () => {
            await createMockUser();
            const loginDto: LoginDto = {
                email: mockEmail,
                password: mockPassword,
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(201);

            expect(response.text).toBeDefined();
            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toContain('refreshToken');

            const refreshTokens = await refreshTokenModel.find({
                userId: validUser._id,
            });
            expect(refreshTokens.length).toBe(1);
        });

        it('should return 400 Bad Request if validation fails', async () => {
            const invalidDto = { email: 'not-an-email', password: '' };
            await request(app.getHttpServer())
                .post('/auth/login')
                .send(invalidDto)
                .expect(400);
        });

        it('should return 404 if user does not exist', async () => {
            const loginDto: LoginDto = {
                email: 'nonexistent@test.com',
                password: 'password',
            };
            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(404);
        });

        it('should return 401 Unauthorized if password is incorrect', async () => {
            await createMockUser();
            const loginDto: LoginDto = {
                email: mockEmail,
                password: 'WrongPassword!',
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(401);
        });
    });

    describe('POST /auth/refresh', () => {
        it('should refresh access token using valid refresh cookie', async () => {
            await createMockUser();
            const loginResp = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: mockEmail, password: mockPassword });

            const cookies = loginResp.headers['set-cookie'];
            const refreshTokenCookie = cookies.find((cookie: string) =>
                cookie.startsWith('refreshToken'),
            );

            const response = await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', [refreshTokenCookie])
                .expect(201);

            expect(response.text).toBeDefined();
            expect(response.text.length).toBeGreaterThan(0);
        });

        it('should return 401 Unauthorized (InvalidCredentials) if no cookie provided', async () => {
            await request(app.getHttpServer())
                .post('/auth/refresh')
                .expect(401);
        });

        it('should return 401 Unauthorized if refresh token is invalid', async () => {
            await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', ['refreshToken=invalidtoken'])
                .expect(401);
        });

        it('should return 401 Unauthorized if refresh token not found in DB', async () => {
            await createMockUser();
            // User logs in to get a valid signed JWT structure
            const loginResp = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: mockEmail, password: mockPassword });

            const cookies = loginResp.headers['set-cookie'];
            const refreshTokenCookie = cookies.find((c) =>
                c.startsWith('refreshToken'),
            );

            // Allow time for DB op or brute force delete
            await refreshTokenModel.deleteMany({});

            await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', [refreshTokenCookie])
                .expect(401);
        });

        it('should return 401 Unauthorized if refresh token is expired', async () => {
            await createMockUser();

            // Login pour obtenir un token valide
            const loginResp = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: mockEmail, password: mockPassword });

            const cookies = loginResp.headers['set-cookie'];
            const refreshTokenCookie = cookies.find((c) =>
                c.startsWith('refreshToken'),
            );

            // On force l'expiration en base de données
            await refreshTokenModel.updateMany(
                {},
                {
                    $set: { expiresAt: new Date(Date.now() - 10000) }, // Date passée
                },
            );

            await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', [refreshTokenCookie])
                .expect(401);
        });

        it('should return 401 Unauthorized if user role has changed', async () => {
            await createMockUser();

            const loginResp = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: mockEmail, password: mockPassword });

            const cookies = loginResp.headers['set-cookie'];
            const refreshTokenCookie = cookies.find((c) =>
                c.startsWith('refreshToken'),
            );

            // Changement du rôle de l'utilisateur après l'émission du token
            await userModel.updateOne(
                { email: mockEmail },
                { role: Role.ADMIN },
            );

            await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', [refreshTokenCookie])
                .expect(401);
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout by deleting refresh token', async () => {
            await createMockUser();
            const loginResp = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: mockEmail, password: mockPassword });

            const cookies = loginResp.headers['set-cookie'];
            const refreshTokenCookie = cookies.find((c) =>
                c.startsWith('refreshToken'),
            );

            // Check token exists
            let count = await refreshTokenModel.countDocuments();
            expect(count).toBe(1);

            await request(app.getHttpServer())
                .post('/auth/logout')
                .set('Cookie', [refreshTokenCookie])
                .expect(201);

            count = await refreshTokenModel.countDocuments();
            expect(count).toBe(0);
        });

        it('should return 401 Unauthorized if no cookie provided', async () => {
            await request(app.getHttpServer()).post('/auth/logout').expect(401);
        });
    });
});
