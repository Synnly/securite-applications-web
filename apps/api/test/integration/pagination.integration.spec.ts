import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model, Types } from 'mongoose';
import { PostModule } from '../../src/post/post.module';
import { Post, PostDocument } from '../../src/post/post.schema';
import { User, UserDocument, UserSchema } from '../../src/user/user.schema';
import { Role } from '../../src/common/roles/roles.enum';
import { AuthGuard } from '../../src/auth/auth.guard';
import { RolesGuard } from '../../src/common/roles/roles.guard';
import { CommentModule } from '../../src/comment/comment.module';
import {
    Comment,
    CommentDocument,
    CommentSchema,
} from '../../src/comment/comment.schema';

describe('Pagination (Integration)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let postModel: Model<PostDocument>;
    let userModel: Model<UserDocument>;
    let commentModel: Model<CommentDocument>;

    const mockAuthorId = new Types.ObjectId();

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri),
                PostModule,
                CommentModule,
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                    { name: Comment.name, schema: CommentSchema },
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
        commentModel = moduleFixture.get<Model<CommentDocument>>(
            getModelToken(Comment.name),
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
        await commentModel.deleteMany({});
    });

    const createMockAuthorInDb = async () => {
        await userModel.create({
            _id: mockAuthorId,
            email: 'author@test.com',
            password: 'hashedpassword',
            role: Role.USER,
        });
    };

    describe('GET /post/all - Pagination', () => {
        it('should return paginated posts with default pagination (page 1, limit 10)', async () => {
            await createMockAuthorInDb();

            // Create 15 posts
            for (let i = 1; i <= 15; i++) {
                await postModel.create({
                    title: `Post ${i}`,
                    body: `Content ${i}`,
                    author: mockAuthorId,
                });
            }

            const response = await request(app.getHttpServer())
                .get('/post/all')
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('page', 1);
            expect(response.body).toHaveProperty('limit', 10);
            expect(response.body).toHaveProperty('total', 15);
            expect(response.body).toHaveProperty('totalPages', 2);
            expect(response.body).toHaveProperty('hasNext', true);
            expect(response.body).toHaveProperty('hasPrev', false);
            expect(response.body.data.length).toBe(10);
        });

        it('should return second page of posts', async () => {
            await createMockAuthorInDb();

            // Create 25 posts
            for (let i = 1; i <= 25; i++) {
                await postModel.create({
                    title: `Post ${i}`,
                    body: `Content ${i}`,
                    author: mockAuthorId,
                });
            }

            const response = await request(app.getHttpServer())
                .get('/post/all?page=2&limit=10')
                .expect(200);

            expect(response.body.page).toBe(2);
            expect(response.body.limit).toBe(10);
            expect(response.body.total).toBe(25);
            expect(response.body.totalPages).toBe(3);
            expect(response.body.hasNext).toBe(true);
            expect(response.body.hasPrev).toBe(true);
            expect(response.body.data.length).toBe(10);
        });

        it('should return last page with remaining items', async () => {
            await createMockAuthorInDb();

            // Create 22 posts
            for (let i = 1; i <= 22; i++) {
                await postModel.create({
                    title: `Post ${i}`,
                    body: `Content ${i}`,
                    author: mockAuthorId,
                });
            }

            const response = await request(app.getHttpServer())
                .get('/post/all?page=3&limit=10')
                .expect(200);

            expect(response.body.page).toBe(3);
            expect(response.body.limit).toBe(10);
            expect(response.body.total).toBe(22);
            expect(response.body.totalPages).toBe(3);
            expect(response.body.hasNext).toBe(false);
            expect(response.body.hasPrev).toBe(true);
            expect(response.body.data.length).toBe(2);
        });

        it('should handle custom limit parameter', async () => {
            await createMockAuthorInDb();

            for (let i = 1; i <= 30; i++) {
                await postModel.create({
                    title: `Post ${i}`,
                    body: `Content ${i}`,
                    author: mockAuthorId,
                });
            }

            const response = await request(app.getHttpServer())
                .get('/post/all?page=1&limit=5')
                .expect(200);

            expect(response.body.limit).toBe(5);
            expect(response.body.totalPages).toBe(6);
            expect(response.body.data.length).toBe(5);
        });

        it('should return empty data array when no posts exist', async () => {
            const response = await request(app.getHttpServer())
                .get('/post/all')
                .expect(200);

            expect(response.body.data).toEqual([]);
            expect(response.body.total).toBe(0);
            expect(response.body.totalPages).toBe(0);
            expect(response.body.hasNext).toBe(false);
            expect(response.body.hasPrev).toBe(false);
        });

        it('should populate author information in paginated results', async () => {
            await createMockAuthorInDb();

            await postModel.create({
                title: 'Test Post',
                body: 'Test Content',
                author: mockAuthorId,
            });

            const response = await request(app.getHttpServer())
                .get('/post/all?page=1&limit=10')
                .expect(200);

            expect(response.body.data[0]).toHaveProperty('author');
            expect(response.body.data[0].author).toHaveProperty('email');
            expect(response.body.data[0].author.email).toBe('author@test.com');
        });
    });

    describe('GET /comment/by-post/:postId - Pagination', () => {
        let mockPostId: Types.ObjectId;

        beforeEach(async () => {
            await createMockAuthorInDb();
            const post = await postModel.create({
                title: 'Test Post',
                body: 'Test Content',
                author: mockAuthorId,
            });
            mockPostId = post._id as Types.ObjectId;
        });

        it('should return paginated comments with default pagination', async () => {
            // Create 15 comments
            for (let i = 1; i <= 15; i++) {
                await commentModel.create({
                    text: `Comment ${i}`,
                    post: mockPostId,
                    author: mockAuthorId,
                });
            }

            const response = await request(app.getHttpServer())
                .get(`/comment/by-post/${mockPostId}`)
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('page', 1);
            expect(response.body).toHaveProperty('limit', 10);
            expect(response.body).toHaveProperty('total', 15);
            expect(response.body).toHaveProperty('totalPages', 2);
            expect(response.body).toHaveProperty('hasNext', true);
            expect(response.body).toHaveProperty('hasPrev', false);
            expect(response.body.data.length).toBe(10);
        });

        it('should return second page of comments', async () => {
            for (let i = 1; i <= 25; i++) {
                await commentModel.create({
                    text: `Comment ${i}`,
                    post: mockPostId,
                    author: mockAuthorId,
                });
            }

            const response = await request(app.getHttpServer())
                .get(`/comment/by-post/${mockPostId}?page=2&limit=10`)
                .expect(200);

            expect(response.body.page).toBe(2);
            expect(response.body.data.length).toBe(10);
            expect(response.body.hasNext).toBe(true);
            expect(response.body.hasPrev).toBe(true);
        });

        it('should filter comments by post ID', async () => {
            const post2 = await postModel.create({
                title: 'Post 2',
                body: 'Content 2',
                author: mockAuthorId,
            });

            await commentModel.create({
                text: 'Comment for Post 1',
                post: mockPostId,
                author: mockAuthorId,
            });

            await commentModel.create({
                text: 'Comment for Post 2',
                post: post2._id,
                author: mockAuthorId,
            });

            const response = await request(app.getHttpServer())
                .get(`/comment/by-post/${mockPostId}`)
                .expect(200);

            expect(response.body.total).toBe(1);
            expect(response.body.data[0].text).toBe('Comment for Post 1');
        });

        it('should return empty data when post has no comments', async () => {
            const response = await request(app.getHttpServer())
                .get(`/comment/by-post/${mockPostId}`)
                .expect(200);

            expect(response.body.data).toEqual([]);
            expect(response.body.total).toBe(0);
            expect(response.body.totalPages).toBe(0);
        });

        it('should populate author information in paginated comments', async () => {
            await commentModel.create({
                text: 'Test Comment',
                post: mockPostId,
                author: mockAuthorId,
            });

            const response = await request(app.getHttpServer())
                .get(`/comment/by-post/${mockPostId}`)
                .expect(200);

            expect(response.body.data[0]).toHaveProperty('author');
            expect(response.body.data[0].author).toHaveProperty('email');
            expect(response.body.data[0].author.email).toBe('author@test.com');
        });
    });

    describe('Pagination - Edge Cases', () => {
        it('should handle page number exceeding total pages', async () => {
            await createMockAuthorInDb();

            for (let i = 1; i <= 5; i++) {
                await postModel.create({
                    title: `Post ${i}`,
                    body: `Content ${i}`,
                    author: mockAuthorId,
                });
            }

            const response = await request(app.getHttpServer())
                .get('/post/all?page=10&limit=10')
                .expect(200);

            expect(response.body.data).toEqual([]);
            expect(response.body.page).toBe(10);
            expect(response.body.total).toBe(5);
            expect(response.body.hasNext).toBe(false);
        });

        it('should reject limit exceeding maximum of 100', async () => {
            await createMockAuthorInDb();

            await postModel.create({
                title: 'Test Post',
                body: 'Content',
                author: mockAuthorId,
            });

            const response = await request(app.getHttpServer())
                .get('/post/all?page=1&limit=150')
                .expect(400);

            expect(response.body.message).toBeDefined();
        });

        it('should reject page < 1', async () => {
            await createMockAuthorInDb();

            await postModel.create({
                title: 'Test Post',
                body: 'Content',
                author: mockAuthorId,
            });

            const response = await request(app.getHttpServer())
                .get('/post/all?page=0&limit=10')
                .expect(400);

            expect(response.body.message).toBeDefined();
        });
    });
});
