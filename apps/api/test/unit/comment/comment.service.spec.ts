import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../../../src/comment/comment.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../../../src/user/user.service';
import { PostService } from '../../../src/post/post.service';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateCommentDto } from '../../../src/comment/dto/createComment.dto';

describe('CommentService', () => {
    let service: CommentService;
    let mockCommentModel: any;
    let mockPostService: any;
    let mockUserService: any;

    const mockAuthorId = new Types.ObjectId().toString();
    const mockPostId = new Types.ObjectId().toString();
    const mockCommentId = new Types.ObjectId();

    const mockComment = {
        _id: mockCommentId,
        text: 'Test comment',
        author: mockAuthorId,
        postId: mockPostId,
    };

    beforeEach(async () => {
        mockCommentModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue(mockComment),
        }));

        mockCommentModel.find = jest.fn();

        mockPostService = {
            findOneById: jest.fn(),
        };

        mockUserService = {
            findOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                {
                    provide: getModelToken('Comment'),
                    useValue: mockCommentModel,
                },
                {
                    provide: PostService,
                    useValue: mockPostService,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        service = module.get<CommentService>(CommentService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAllByPostId', () => {
        it('should return comments for a post', async () => {
            const expectedComments = [mockComment];

            const mockExec = jest.fn().mockResolvedValue(expectedComments);
            const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
            mockCommentModel.find.mockReturnValue({ populate: mockPopulate });

            const result = await service.findAllByPostId(mockPostId);

            expect(result).toEqual(expectedComments);
            expect(mockCommentModel.find).toHaveBeenCalledWith({
                postId: mockPostId,
            });
            expect(mockPopulate).toHaveBeenCalledWith('author', '_id email');
            expect(mockExec).toHaveBeenCalled();
        });

        it('should return an empty array when no comments found', async () => {
            const mockExec = jest.fn().mockResolvedValue([]);
            const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
            mockCommentModel.find.mockReturnValue({ populate: mockPopulate });

            const result = await service.findAllByPostId(mockPostId);

            expect(result).toEqual([]);
        });

        it('should propagate database errors', async () => {
            const error = new Error('Database connection error');
            const mockExec = jest.fn().mockRejectedValue(error);
            const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
            mockCommentModel.find.mockReturnValue({ populate: mockPopulate });

            await expect(service.findAllByPostId(mockPostId)).rejects.toThrow(
                error,
            );
        });
    });

    describe('create', () => {
        const createDto: CreateCommentDto = {
            content: 'New Comment',
        };

        it('should create a comment successfully', async () => {
            mockUserService.findOne.mockResolvedValue({ _id: mockAuthorId });
            mockPostService.findOneById.mockResolvedValue({ _id: mockPostId });

            await service.create(createDto, mockAuthorId, mockPostId);

            expect(mockUserService.findOne).toHaveBeenCalledWith(mockAuthorId);
            expect(mockPostService.findOneById).toHaveBeenCalledWith(
                mockPostId,
            );
            expect(mockCommentModel).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...createDto,
                    author: mockAuthorId,
                    postId: mockPostId,
                }),
            );
        });

        it('should propagate error if save fails', async () => {
            mockUserService.findOne.mockResolvedValue({ _id: mockAuthorId });
            mockPostService.findOneById.mockResolvedValue({ _id: mockPostId });

            const error = new Error('Database save error');
            // Override mockimplementation for this specific test to fail save
            mockCommentModel.mockImplementationOnce((dto) => ({
                ...dto,
                save: jest.fn().mockRejectedValue(error),
            }));

            await expect(
                service.create(createDto, mockAuthorId, mockPostId),
            ).rejects.toThrow(error);
        });

        it('should throw NotFoundException if author not found', async () => {
            mockUserService.findOne.mockResolvedValue(null);

            await expect(
                service.create(createDto, mockAuthorId, mockPostId),
            ).rejects.toThrow(NotFoundException);

            expect(mockUserService.findOne).toHaveBeenCalledWith(mockAuthorId);
            expect(mockPostService.findOneById).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if post not found', async () => {
            mockUserService.findOne.mockResolvedValue({ _id: mockAuthorId });
            mockPostService.findOneById.mockResolvedValue(null);

            await expect(
                service.create(createDto, mockAuthorId, mockPostId),
            ).rejects.toThrow(NotFoundException);

            expect(mockUserService.findOne).toHaveBeenCalledWith(mockAuthorId);
            expect(mockPostService.findOneById).toHaveBeenCalledWith(
                mockPostId,
            );
        });
    });
});
