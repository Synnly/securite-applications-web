import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../../../src/comment/comment.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../../../src/user/user.service';
import { PostService } from '../../../src/post/post.service';
import { PaginationService } from '../../../src/common/pagination/pagination.service';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateCommentDto } from '../../../src/comment/dto/createComment.dto';

describe('CommentService', () => {
    let service: CommentService;
    let mockCommentModel: any;
    let mockPostService: any;
    let mockUserService: any;
    let mockPaginationService: any;

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

        mockPaginationService = {
            paginate: jest.fn(),
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
                {
                    provide: PaginationService,
                    useValue: mockPaginationService,
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
            mockPostService.findOneById.mockResolvedValue({ _id: mockPostId });

            const expectedResult = {
                data: [mockComment],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
            };

            mockPaginationService.paginate.mockResolvedValue(expectedResult);

            const result = await service.findAllByPostId(mockPostId, {
                page: 1,
                limit: 10,
            });

            expect(result).toEqual(expectedResult);
            expect(mockPostService.findOneById).toHaveBeenCalledWith(
                mockPostId,
            );
            expect(mockPaginationService.paginate).toHaveBeenCalledWith(
                mockCommentModel,
                1,
                10,
                [{ path: 'author', select: '_id email' }],
                { deletedAt: null, post: mockPostId },
            );
        });

        it('should throw NotFoundException if post for comments listing not found', async () => {
            mockPostService.findOneById.mockResolvedValue(null);

            await expect(
                service.findAllByPostId(mockPostId, { page: 1, limit: 10 }),
            ).rejects.toThrow(NotFoundException);
            expect(mockPostService.findOneById).toHaveBeenCalledWith(
                mockPostId,
            );
            expect(mockPaginationService.paginate).not.toHaveBeenCalled();
        });

        it('should return empty data when no comments found', async () => {
            mockPostService.findOneById.mockResolvedValue({ _id: mockPostId });

            const emptyResult = {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
            };

            mockPaginationService.paginate.mockResolvedValue(emptyResult);

            const result = await service.findAllByPostId(mockPostId, {
                page: 1,
                limit: 10,
            });

            expect(result).toEqual(emptyResult);
        });

        it('should propagate database errors', async () => {
            mockPostService.findOneById.mockResolvedValue({ _id: mockPostId });

            const error = new Error('Database connection error');
            mockPaginationService.paginate.mockRejectedValue(error);

            await expect(
                service.findAllByPostId(mockPostId, { page: 1, limit: 10 }),
            ).rejects.toThrow(error);
        });
    });

    describe('create', () => {
        const createDto: CreateCommentDto = {
            text: 'New Comment',
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
                    author: { _id: mockAuthorId },
                    post: { _id: mockPostId },
                }),
            );
        });

        it('should propagate error if save fails', async () => {
            mockUserService.findOne.mockResolvedValue({ _id: mockAuthorId });
            mockPostService.findOneById.mockResolvedValue({ _id: mockPostId });

            const error = new Error('Database save error');
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
