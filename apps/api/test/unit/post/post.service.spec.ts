import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../../../src/post/post.service';
import { UserService } from '../../../src/user/user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Post } from '../../../src/post/post.schema';
import { CreatePostDto } from '../../../src/post/dto/createPost.dto';
import { Types } from 'mongoose';

describe('PostService', () => {
    let service: PostService;
    let mockPostModel: any;
    let userService: UserService;

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
        mockPostModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue({
                ...dto,
                _id: new Types.ObjectId(),
            }),
        }));

        (mockPostModel as any).find = jest.fn();
        (mockPostModel as any).findById = jest.fn();
        (mockPostModel as any).findByIdAndDelete = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostService,
                {
                    provide: getModelToken(Post.name),
                    useValue: mockPostModel,
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PostService>(PostService);
        userService = module.get<UserService>(UserService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of posts', async () => {
            const expectedPosts = [mockPost];

            (mockPostModel as any).find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(expectedPosts),
                }),
            });

            const result = await service.findAll();

            expect(result).toEqual(expectedPosts);
            expect(mockPostModel.find).toHaveBeenCalledTimes(1);
        });

        it('should return an empty array when no posts exist', async () => {
            (mockPostModel as any).find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue([]),
                }),
            });

            const result = await service.findAll();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should propagate error if database find fails', async () => {
            const error = new Error('Database connection error');
            (mockPostModel as any).find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockRejectedValue(error),
                }),
            });

            await expect(service.findAll()).rejects.toThrow(error);
        });
    });

    describe('findOneById', () => {
        it('should return a post if found', async () => {
            (mockPostModel as any).findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockPost),
            });

            const result = await service.findOneById(postId.toString());

            expect(result).toEqual(mockPost);
            expect(mockPostModel.findById).toHaveBeenCalledWith(
                postId.toString(),
            );
        });

        it('should return null if post is not found', async () => {
            (mockPostModel as any).findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await service.findOneById('unknown-id');

            expect(result).toBeNull();
        });

        it('should propagate error if database findById fails', async () => {
            const error = new Error('Database error');
            (mockPostModel as any).findById.mockReturnValue({
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

            (userService.findOne as jest.Mock).mockResolvedValue({
                _id: authorId,
            });

            await service.create(createPostDto, authorId.toString());

            expect(mockPostModel).toHaveBeenCalled();
        });

        it('should propagate error if database creation fails', async () => {
            const createPostDto: CreatePostDto = {
                title: 'Error Post',
                body: 'Content',
            };

            (userService.findOne as jest.Mock).mockResolvedValue({
                _id: authorId,
            });

            const error = new Error('Save error');

            mockPostModel.mockImplementationOnce(() => ({
                save: jest.fn().mockRejectedValue(error),
            }));

            await expect(
                service.create(createPostDto, authorId.toString()),
            ).rejects.toThrow(error);
        });
    });

    describe('deleteById', () => {
        it('should delete a post successfully', async () => {
            (mockPostModel as any).findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockPost),
            });

            await service.deleteById(postId.toString());

            expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledWith(
                postId.toString(),
            );
            expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
        });

        it('should propagate error if database delete fails', async () => {
            const error = new Error('Delete failed');
            (mockPostModel as any).findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });

            await expect(service.deleteById('some-id')).rejects.toThrow(error);
        });
    });
});
