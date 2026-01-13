import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from '../../../src/post/post.controller';
import { PostService } from '../../../src/post/post.service';
import { CreatePostDto } from '../../../src/post/dto/createPost.dto';
import { PostDto } from '../../../src/post/dto/post.dto';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('PostController', () => {
    let controller: PostController;
    let postService: PostService;
    let mockPostService: any;

    const postId = new Types.ObjectId('507f1f77bcf86cd799439011');
    const authorId = new Types.ObjectId('507f1f77bcf86cd799439012');

    const mockPost = {
        _id: postId,
        title: 'Test Post Title',
        body: 'Test Body Content',
        author: authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        mockPostService = {
            findAll: jest.fn(),
            findOneById: jest.fn(),
            create: jest.fn(),
            deleteById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostController],
            providers: [
                {
                    provide: PostService,
                    useValue: mockPostService,
                },
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn(),
                        sign: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<PostController>(PostController);
        postService = module.get<PostService>(PostService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated PostDto', async () => {
            const mockPaginatedResult = {
                data: [mockPost],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
            };

            mockPostService.findAll.mockResolvedValue(mockPaginatedResult);

            const query = { page: 1, limit: 10 };
            const result = await controller.findAll(query);

            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0]).toBeInstanceOf(PostDto);

            expect(result.data[0].id).toEqual(postId);
            expect(result.data[0].title).toBe('Test Post Title');
            expect(result.total).toBe(1);

            expect(mockPostService.findAll).toHaveBeenCalledWith(query);
        });

        it('should return empty data if no posts found', async () => {
            const emptyResult = {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
            };

            mockPostService.findAll.mockResolvedValue(emptyResult);

            const query = { page: 1, limit: 10 };
            const result = await controller.findAll(query);

            expect(result.data).toEqual([]);
            expect(result.total).toBe(0);
        });
    });

    describe('findOne', () => {
        it('should return a PostDto if found', async () => {
            mockPostService.findOneById.mockResolvedValue(mockPost);

            const result = await controller.findOne(postId.toString());

            expect(result).toBeInstanceOf(PostDto);
            expect(result.id).toEqual(postId);
            expect(result.title).toBe('Test Post Title');

            expect(mockPostService.findOneById).toHaveBeenCalledWith(
                postId.toString(),
            );
        });

        it('should throw NotFoundException if post is not found', async () => {
            mockPostService.findOneById.mockResolvedValue(null);

            await expect(controller.findOne(postId.toString())).rejects.toThrow(
                NotFoundException,
            );

            expect(mockPostService.findOneById).toHaveBeenCalledWith(
                postId.toString(),
            );
        });
    });

    describe('create', () => {
        const createPostDto: CreatePostDto = {
            title: 'New Post',
            body: 'New Content',
        };

        const mockRequest = {
            user: { sub: authorId },
            sub: authorId,
        };

        it('should create a post successfully', async () => {
            mockPostService.create.mockResolvedValue(undefined);

            await controller.create(mockRequest as any, createPostDto);

            expect(mockPostService.create).toHaveBeenCalled();
        });

        it('should propagate errors from service', async () => {
            const error = new Error('Validation failed');
            mockPostService.create.mockRejectedValue(error);

            await expect(
                controller.create(mockRequest as any, createPostDto),
            ).rejects.toThrow(error);
        });
    });

    describe('delete', () => {
        it('should delete a post successfully', async () => {
            mockPostService.deleteById.mockResolvedValue(undefined);

            await controller.delete(postId.toString());

            expect(mockPostService.deleteById).toHaveBeenCalledWith(
                postId.toString(),
            );
            expect(mockPostService.deleteById).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from service', async () => {
            const error = new Error('Delete failed');
            mockPostService.deleteById.mockRejectedValue(error);

            await expect(controller.delete(postId.toString())).rejects.toThrow(
                error,
            );
        });
    });
});
