import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../../../src/post/post.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../../../src/user/user.service';
import { Post } from '../../../src/post/post.schema';

describe('PostService', () => {
    let service: PostService;
    let mockPostModel: any;
    let mockUserService: any;

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
            ],
        }).compile();

        service = module.get<PostService>(PostService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all posts', async () => {
            const result = await service.findAll();
            expect(mockPostModel.find).toHaveBeenCalledWith({
                deletedAt: null,
            });
            // Pas d'assertion sur le résultat car exec retourne undefined par défaut ici, l'important est la définition du mock
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
