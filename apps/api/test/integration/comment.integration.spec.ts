import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CommentModule } from '../../src/comment/comment.module';
import { CreateCommentDto } from '../../src/comment/dto/createComment.dto';
import { AuthGuard } from '../../src/auth/auth.guard';
import { RolesGuard } from '../../src/common/roles/roles.guard';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../../src/comment/comment.schema';
import { User, UserDocument, UserSchema } from '../../src/user/user.schema';
import { Post, PostDocument, PostSchema } from '../../src/post/post.schema';
import { Role } from '../../src/common/roles/roles.enum';

describe('CommentModule (Integration)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let commentModel: Model<CommentDocument>;
    let userModel: Model<UserDocument>;
    let postModel: Model<PostDocument>;

    const mockAuthorId = new Types.ObjectId();
    const mockPostId = new Types.ObjectId();

    const validCommentDto: CreateCommentDto = {
        text: 'This is a test comment',
    };

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri),
                CommentModule,
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                    { name: Post.name, schema: PostSchema },
                ]),
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = {
                        sub: mockAuthorId.toString(),
                        role: Role.USER,
                    };
                    return true;
                },
            })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication();

        commentModel = moduleFixture.get<Model<CommentDocument>>(
            getModelToken(Comment.name),
        );
        userModel = moduleFixture.get<Model<UserDocument>>(
            getModelToken(User.name),
        );
        postModel = moduleFixture.get<Model<PostDocument>>(
            getModelToken(Post.name),
        );

        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await mongod.stop();
    });

    afterEach(async () => {
        await commentModel.deleteMany({});
        await userModel.deleteMany({});
        await postModel.deleteMany({});
    });

    const createMockDataInDb = async () => {
        await userModel.create({
            _id: mockAuthorId,
            email: 'author@test.com',
            password: 'hashedpassword',
            role: Role.USER,
        });

        await postModel.create({
            _id: mockPostId,
            title: 'Test Post',
            body: 'Body content',
            author: mockAuthorId,
        });
    };

    describe('POST /comment/by-post/:postId', () => {
        it('should create a comment successfully', async () => {
            await createMockDataInDb();

            const response = await request(app.getHttpServer())
                .post(`/comment/by-post/${mockPostId}`)
                .send(validCommentDto)
                .expect(201);

            const comments = await commentModel.find();
            expect(comments.length).toBe(1);
            expect(comments[0].text).toEqual(validCommentDto.text);
            expect(comments[0].author.toString()).toEqual(
                mockAuthorId.toString(),
            );
            expect(comments[0].post.toString()).toEqual(mockPostId.toString());
        });

        it('should return 400 Bad Request if validation fails', async () => {
            const invalidDto = { ...validCommentDto, text: '' };
            await createMockDataInDb();

            await request(app.getHttpServer())
                .post(`/comment/by-post/${mockPostId}`)
                .send(invalidDto)
                .expect(400);
        });

        it('should return 404 if post does not exist', async () => {
            await userModel.create({
                _id: mockAuthorId,
                email: 'author@test.com',
                password: 'hash',
                role: Role.USER,
            });

            const fakePostId = new Types.ObjectId().toString();

            await request(app.getHttpServer())
                .post(`/comment/by-post/${fakePostId}`)
                .send(validCommentDto)
                .expect(404);
        });

        it('should return 404 if post is soft-deleted', async () => {
            const deletedPostId = new Types.ObjectId();
            await postModel.create({
                _id: deletedPostId,
                title: 'Deleted Post',
                body: 'Content',
                author: mockAuthorId,
                deletedAt: new Date(),
            });

            await userModel.create({
                _id: mockAuthorId,
                email: 'author@test.com',
                password: 'hash',
                role: Role.USER,
            });

            await request(app.getHttpServer())
                .post(`/comment/by-post/${deletedPostId}`)
                .send(validCommentDto)
                .expect(404);
        });

        it('should return 404 if author does not exist', async () => {
            await postModel.create({
                _id: mockPostId,
                title: 'Test',
                body: 'body',
                author: new Types.ObjectId(),
            });

            await request(app.getHttpServer())
                .post(`/comment/by-post/${mockPostId}`)
                .send(validCommentDto)
                .expect(404);
        });

        it('should return 400 if postId is invalid', async () => {
            await request(app.getHttpServer())
                .post('/comment/by-post/invalid-id')
                .send(validCommentDto)
                .expect(400);
        });
    });

    describe('GET /comment/by-post/:postId', () => {
        it('should return comments for a post without sensitive data', async () => {
            await createMockDataInDb();

            await commentModel.create({
                text: 'Comment 1',
                author: mockAuthorId,
                post: mockPostId,
            });

            const response = await request(app.getHttpServer())
                .get(`/comment/by-post/${mockPostId}`)
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].text).toEqual('Comment 1');

            expect(response.body.data[0].author).toBeDefined();
            expect(response.body.data[0].author.email).toEqual('author@test.com');
            expect(response.body.data[0].author.password).toBeUndefined();

            const responseId = response.body.data[0].id || response.body.data[0]._id;
            expect(responseId).toBeDefined();
        });

        it('should return empty array if post has no comments', async () => {
            await createMockDataInDb();

            const response = await request(app.getHttpServer())
                .get(`/comment/by-post/${mockPostId}`)
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toEqual([]);
            expect(response.body.total).toBe(0);
        });

        it('should return 404 if post does not exist', async () => {
            const fakePostId = new Types.ObjectId().toString();

            await request(app.getHttpServer())
                .get(`/comment/by-post/${fakePostId}`)
                .expect(404);
        });

        it('should return 404 if post is soft-deleted', async () => {
            const deletedPostId = new Types.ObjectId();
            await postModel.create({
                _id: deletedPostId,
                title: 'Deleted Post',
                body: 'Content',
                author: mockAuthorId,
                deletedAt: new Date(),
            });

            await request(app.getHttpServer())
                .get(`/comment/by-post/${deletedPostId}`)
                .expect(404);
        });

        it('should return 400 if postId is invalid', async () => {
            await request(app.getHttpServer())
                .get('/comment/by-post/invalid-id')
                .expect(400);
        });
    });
});
