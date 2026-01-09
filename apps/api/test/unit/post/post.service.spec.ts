import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../../../src/post/post.service';
import { getModelToken } from '@nestjs/mongoose';
import { Post } from '../../../src/post/post.schema';
import { CreatePostDto } from '../../../src/post/dto/createPost.dto';
import { Types } from 'mongoose';

describe('PostService', () => {
    let service: PostService;
    let mockPostModel: any;

    // Données de test
    const postId = new Types.ObjectId('507f1f77bcf86cd799439011');
    const authorId = new Types.ObjectId('507f1f77bcf86cd799439012');

    const mockPost = {
        _id: postId,
        title: 'Test Post Title',
        body: 'This is the content of the test post.',
        author: authorId,
    };

    beforeEach(async () => {
        // Mock des méthodes Mongoose
        // Note: find, findById, findByIdAndDelete retournent un Query object qui a une méthode exec()
        mockPostModel = {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndDelete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostService,
                {
                    provide: getModelToken(Post.name),
                    useValue: mockPostModel,
                },
            ],
        }).compile();

        service = module.get<PostService>(PostService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of posts', async () => {
            const expectedPosts = [mockPost];
            mockPostModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(expectedPosts),
            });

            const result = await service.findAll();

            expect(result).toEqual(expectedPosts);
            expect(mockPostModel.find).toHaveBeenCalledTimes(1);
        });

        it('should return an empty array when no posts exist', async () => {
            mockPostModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            });

            const result = await service.findAll();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should propagate error if database find fails', async () => {
            const error = new Error('Database connection error');
            mockPostModel.find.mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });

            await expect(service.findAll()).rejects.toThrow(error);
        });
    });

    describe('findOneById', () => {
        it('should return a post if found', async () => {
            mockPostModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockPost),
            });

            const result = await service.findOneById(postId.toString());

            expect(result).toEqual(mockPost);
            expect(mockPostModel.findById).toHaveBeenCalledWith(
                postId.toString(),
            );
        });

        it('should return null if post is not found', async () => {
            mockPostModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await service.findOneById('unknown-id');

            expect(result).toBeNull();
        });

        it('should propagate error if database findById fails', async () => {
            const error = new Error('Database error');
            mockPostModel.findById.mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });

            await expect(service.findOneById('some-id')).rejects.toThrow(error);
        });
    });

    describe('create', () => {
        it('should create a new post successfully', async () => {
            const createPostDto: CreatePostDto = {
                title: 'New Post',
                body: 'New Body Content',
            };

            // create retourne généralement le document créé ou void selon l'implémentation
            mockPostModel.create.mockResolvedValue(mockPost);

            await service.create(createPostDto);

            expect(mockPostModel.create).toHaveBeenCalledWith(
                expect.objectContaining(createPostDto),
            );
            expect(mockPostModel.create).toHaveBeenCalledTimes(1);
        });

        it('should propagate error if database creation fails', async () => {
            const createPostDto: CreatePostDto = {
                title: 'Error Post',
                body: 'Content',
            };
            const error = new Error('Validation error');
            mockPostModel.create.mockRejectedValue(error);

            await expect(service.create(createPostDto)).rejects.toThrow(error);
        });
    });

    describe('deleteById', () => {
        it('should delete a post successfully', async () => {
            mockPostModel.findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockPost), // Retourne le doc supprimé ou null
            });

            await service.deleteById(postId.toString());

            expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledWith(
                postId.toString(),
            );
            expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
        });

        it('should propagate error if database delete fails', async () => {
            const error = new Error('Delete failed');
            mockPostModel.findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });

            await expect(service.deleteById('some-id')).rejects.toThrow(error);
        });
    });
});
