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
        it('should return an array of CommentDto', async () => {
            mockCommentService.findAllByPostId.mockResolvedValue([mockComment]);

            const result = await controller.findAll(mockPostId);

            expect(result).toHaveLength(1);
            expect(result[0].id).toEqual(mockCommentId); // Transform id: _id
            expect(result[0].text).toEqual(mockComment.text);
            expect(mockCommentService.findAllByPostId).toHaveBeenCalledWith(
                mockPostId,
            );
        });

        it('should return an empty array if no comments found', async () => {
            mockCommentService.findAllByPostId.mockResolvedValue([]);

            const result = await controller.findAll(mockPostId);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
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
