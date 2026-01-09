import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from '../../../src/post/post.controller';
import { PostService } from '../../../src/post/post.service';
import { CreatePostDto } from '../../../src/post/dto/createPost.dto';
import { PostDto } from '../../../src/post/dto/post.dto';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

describe('PostController', () => {
    let controller: PostController;
    let postService: PostService;
    let mockPostService: any;

    // Données de test
    const postId = new Types.ObjectId('507f1f77bcf86cd799439011');
    const authorId = new Types.ObjectId('507f1f77bcf86cd799439012');

    // Objet simulant un document Mongoose (avant transformation DTO)
    const mockPost = {
        _id: postId,
        title: 'Test Post Title',
        body: 'Test Body Content',
        author: authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        // Réinitialisation du mock pour chaque test
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
        it('should return an array of PostDto', async () => {
            mockPostService.findAll.mockResolvedValue([mockPost]);

            const result = await controller.findAll();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(PostDto);

            // Vérification de la transformation (mappage _id -> id)
            expect(result[0].id).toEqual(postId);
            expect(result[0].title).toBe('Test Post Title');

            expect(mockPostService.findAll).toHaveBeenCalledTimes(1);
        });

        it('should return an empty array if no posts found', async () => {
            mockPostService.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
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

        it('should create a post successfully', async () => {
            mockPostService.create.mockResolvedValue(undefined);

            await controller.create(createPostDto);

            expect(mockPostService.create).toHaveBeenCalledWith(createPostDto);
            expect(mockPostService.create).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from service', async () => {
            const error = new Error('Validation failed');
            mockPostService.create.mockRejectedValue(error);

            await expect(controller.create(createPostDto)).rejects.toThrow(
                error,
            );
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
