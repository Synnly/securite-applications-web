import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../../../src/post/post.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../../../src/user/user.service';
import { PaginationService } from '../../../src/common/pagination/pagination.service';
import { Post } from '../../../src/post/post.schema';

describe('PostService', () => {
    let service: PostService;
    let mockPostModel: any;
    let mockUserService: any;
    let mockPaginationService: any;

    const mockAuthorId = '507f1f77bcf86cd799439011';
    const mockPostId = '507f1f77bcf86cd799439012';

    beforeEach(async () => {
        // Mock de la chaîne find/findOne -> populate -> exec
        const mockExec = jest.fn();
        const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
        const mockQueryChain = { populate: mockPopulate, exec: mockExec };

        mockPostModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            save: jest.fn(),
        }));

        // Attachement des méthodes au mock du modèle
        mockPostModel.find = jest
            .fn()
            .mockReturnValue({ populate: mockPopulate });
        // Utilisation de findOne pour supporter la logique de soft-delete check
        mockPostModel.findOne = jest
            .fn()
            .mockReturnValue({ populate: mockPopulate });
        mockPostModel.findByIdAndUpdate = jest
            .fn()
            .mockReturnValue({ exec: jest.fn() });

        mockUserService = {
            findOne: jest.fn(),
        };

        mockPaginationService = {
            paginate: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostService,
                {
                    provide: getModelToken(Post.name),
                    useValue: mockPostModel,
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

        service = module.get<PostService>(PostService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated posts', async () => {
            const mockResult = {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
            };
            mockPaginationService.paginate.mockResolvedValue(mockResult);

            const result = await service.findAll({ page: 1, limit: 10 });
            
            expect(result).toEqual(mockResult);
            expect(mockPaginationService.paginate).toHaveBeenCalledWith(
                mockPostModel,
                1,
                10,
                [{ path: 'author', select: '_id email' }],
                { deletedAt: null },
            );
        });
    });

    describe('findOneById', () => {
        it('should find one post by id', async () => {
            await service.findOneById(mockPostId);
            expect(mockPostModel.findOne).toHaveBeenCalledWith({
                _id: mockPostId,
                deletedAt: null,
            });
        });
    });

    // Vous pouvez ajouter d'autres tests unitaires ici si besoin
});
