import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from '../../../src/comment/comment.controller';
import { CommentService } from '../../../src/comment/comment.service';
import { CreateCommentDto } from '../../../src/comment/dto/createComment.dto';
import { Types } from 'mongoose';
import { AuthGuard } from '../../../src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('CommentController', () => {
    let controller: CommentController;
    let mockCommentService: any;

    const mockPostId = new Types.ObjectId().toString();
    const mockAuthorId = new Types.ObjectId().toString();
    const mockCommentId = new Types.ObjectId();

    // Doit correspondre à la structure attendue par CommentDto et plainToInstance
    const mockComment = {
        _id: mockCommentId,
        text: 'Test content',
        author: { _id: mockAuthorId, email: 'test@test.com' },
        createdAt: new Date(),
    };

    beforeEach(async () => {
        mockCommentService = {
            findAllByPostId: jest.fn(),
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentController],
            providers: [
                {
                    provide: CommentService,
                    useValue: mockCommentService,
                },
                // Mock JwtService nécessaire car AuthGuard l'utilise peut-être implicitement lors de l'initialisation du module
                {
                    provide: JwtService,
                    useValue: {},
                },
            ],
        })
            .overrideGuard(AuthGuard) // On override le Guard pour simplifier les tests unitaires
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<CommentController>(CommentController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated CommentDto', async () => {
            const mockPaginatedResult = {
                data: [mockComment],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
            };

            mockCommentService.findAllByPostId.mockResolvedValue(
                mockPaginatedResult,
            );

            const query = { page: 1, limit: 10 };
            const result = await controller.findAll(mockPostId, query);

            expect(result.data).toHaveLength(1);
            expect(result.data[0].id).toEqual(mockCommentId);
            expect(result.data[0].text).toEqual(mockComment.text);
            expect(result.total).toBe(1);
            expect(result.page).toBe(1);
            expect(mockCommentService.findAllByPostId).toHaveBeenCalledWith(
                mockPostId,
                query,
            );
        });

        it('should return empty data when no comments found', async () => {
            const emptyResult = {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
            };

            mockCommentService.findAllByPostId.mockResolvedValue(emptyResult);

            const query = { page: 1, limit: 10 };
            const result = await controller.findAll(mockPostId, query);

            expect(result.data).toEqual([]);
            expect(result.total).toBe(0);
        });
    });

    describe('create', () => {
        it('should create a comment successfully', async () => {
            const dto: CreateCommentDto = { content: 'Nice post!' };

            // Simulation de l'objet Request enrichi par le Guard/Passport normalement
            const req = {
                user: {
                    sub: mockAuthorId,
                },
            };

            mockCommentService.create.mockResolvedValue(undefined);

            await controller.create(req as any, dto, mockPostId);

            expect(mockCommentService.create).toHaveBeenCalledWith(
                dto,
                mockAuthorId,
                mockPostId,
            );
        });
    });
});
