import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PostModule } from '../../src/post/post.module';
import { CreatePostDto } from '../../src/post/dto/createPost.dto';
import { AuthGuard } from '../../src/auth/auth.guard';
import { RolesGuard } from '../../src/common/roles/roles.guard';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../../src/post/post.schema';
import { User, UserDocument, UserSchema } from '../../src/user/user.schema';
import { Role } from '../../src/common/roles/roles.enum';

describe('PostModule (Integration)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let postModel: Model<PostDocument>;
    let userModel: Model<UserDocument>;

    const mockAuthorId = new Types.ObjectId();

    const validPostDto: CreatePostDto = {
        title: 'Integration Test Post',
        body: 'Content of the test post',
    };

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri),
                PostModule,
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                ]),
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = {
                        sub: mockAuthorId.toString(),
                        role: Role.ADMIN,
                    };
                    return true;
                },
            })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication();

        postModel = moduleFixture.get<Model<PostDocument>>(
            getModelToken(Post.name),
        );
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
        await postModel.deleteMany({});
        await userModel.deleteMany({});
    });

    const createMockAuthorInDb = async () => {
        await userModel.create({
            _id: mockAuthorId,
            email: 'author@test.com',
            password: 'hashedpassword',
            role: Role.USER,
        });
    };

    describe('POST /post', () => {
        it('should create a post successfully', async () => {
            await createMockAuthorInDb();

            const response = await request(app.getHttpServer())
                .post('/post')
                .send(validPostDto)
                .expect(201);

            const posts = await postModel.find();
            expect(posts.length).toBe(1);
            expect(posts[0].title).toEqual(validPostDto.title);
            expect(posts[0].body).toEqual(validPostDto.body);
            expect(posts[0].author.toString()).toEqual(mockAuthorId.toString());
        });

        it('should return 400 Bad Request if validation fails (empty title)', async () => {
            const invalidDto = { ...validPostDto, title: '' };

            await createMockAuthorInDb();

            await request(app.getHttpServer())
                .post('/post')
                .send(invalidDto)
                .expect(400);
        });

        it('should return 404 if the authenticated user does not exist in DB', async () => {
            await request(app.getHttpServer())
                .post('/post')
                .send(validPostDto)
                .expect(404);
        });
    });

    describe('GET /post/all', () => {
        it('should return an empty array if no posts exist', async () => {
            const response = await request(app.getHttpServer())
                .get('/post/all')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it('should return all posts with populated author info', async () => {
            await createMockAuthorInDb();
            await postModel.create({
                ...validPostDto,
                author: mockAuthorId,
            });

            const response = await request(app.getHttpServer())
                .get('/post/all')
                .expect(200);

            expect(response.body.length).toBe(1);
            expect(response.body[0].title).toEqual(validPostDto.title);
            expect(response.body[0].author).toBeDefined();
            expect(response.body[0].author.email).toEqual('author@test.com');
        });
    });

    describe('GET /post/by-id/:postId', () => {
        it('should return a post by ID with populated author info', async () => {
            await createMockAuthorInDb();
            const post = await postModel.create({
                ...validPostDto,
                author: mockAuthorId,
            });
            const id = post._id.toString();

            const response = await request(app.getHttpServer())
                .get(`/post/by-id/${id}`)
                .expect(200);

            expect(response.body.title).toEqual(validPostDto.title);
            expect(response.body.author).toBeDefined();
            expect(response.body.author.email).toEqual('author@test.com');

            const responseId = response.body.id || response.body._id;
            expect(responseId).toEqual(id);
        });

        it('should return 404 if post not found', async () => {
            const fakeId = new Types.ObjectId().toString();
            await request(app.getHttpServer())
                .get(`/post/by-id/${fakeId}`)
                .expect(404);
        });

        it('should return 400 if post ID is invalid (ParseObjectIdPipe)', async () => {
            await request(app.getHttpServer())
                .get('/post/by-id/invalid-id')
                .expect(400);
        });
    });

    describe('DELETE /post/:postId', () => {
        it('should delete a post successfully', async () => {
            await createMockAuthorInDb();
            const post = await postModel.create({
                ...validPostDto,
                author: mockAuthorId,
            });
            const id = post._id.toString();

            await request(app.getHttpServer())
                .delete(`/post/${id}`)
                .expect(200);

            const checkPost = await postModel.findById(id);
            expect(checkPost).toBeDefined();
            expect(checkPost!.deletedAt).toBeDefined();
            expect(checkPost!.deletedAt).toBeInstanceOf(Date);
        });

        it('should handle deletion of non-existing post gracefully (idempotent or 404?)', async () => {
            const fakeId = new Types.ObjectId().toString();

            await request(app.getHttpServer())
                .delete(`/post/${fakeId}`)
                .expect(200);
        });
    });
});
