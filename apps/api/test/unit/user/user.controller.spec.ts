import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../../src/user/user.controller';
import { UserService } from '../../../src/user/user.service';
import { CreateUserDto } from '../../../src/user/dto/createUser.dto';
import { Role } from '../../../src/common/roles/roles.enum';
import { Types } from 'mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('UserController', () => {
    let controller: UserController;
    let userService: UserService;
    let mockUserService: any; // On déclare la variable ici

    // Données de test
    const userId = new Types.ObjectId('507f1f77bcf86cd799439011');
    const mockUser = {
        _id: userId,
        email: 'test@example.com',
        role: Role.USER,
        password: 'hashedpassword',
    };

    beforeEach(async () => {
        // On recrée l'objet mock pour chaque test pour éviter les fuites d'état
        mockUserService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            banUser: jest.fn(),
            unbanUser: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
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

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of user DTOs', async () => {
            const expectedUsers = [mockUser];
            mockUserService.findAll.mockResolvedValue(expectedUsers);

            const result = await controller.findAll();

            // On vérifie que le résultat est un tableau
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
            // plainToInstance transforme les objets, on vérifie que les données principales sont là
            expect(result[0]).toEqual(
                expect.objectContaining({
                    email: 'test@example.com',
                }),
            );

            expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
        });

        it('should return an empty array if no users found', async () => {
            mockUserService.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
    });

    describe('findOne', () => {
        it('should return a user DTO if found', async () => {
            mockUserService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne(userId.toString());

            expect(result).toBeDefined();
            expect(result).toEqual(
                expect.objectContaining({
                    email: 'test@example.com',
                }),
            );
            expect(mockUserService.findOne).toHaveBeenCalledWith(
                userId.toString(),
            );
        });

        it('should throw NotFoundException if user is not found', async () => {
            mockUserService.findOne.mockResolvedValue(null);

            await expect(controller.findOne('unknown-id')).rejects.toThrow(
                NotFoundException,
            );
            expect(mockUserService.findOne).toHaveBeenCalledWith('unknown-id');
        });
    });

    describe('create', () => {
        const createUserDto: CreateUserDto = {
            email: 'newuser@example.com',
            password: 'password123',
            role: Role.USER,
        };

        it('should create a user successfully', async () => {
            mockUserService.create.mockResolvedValue(undefined);

            await controller.create(createUserDto);

            expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
            expect(mockUserService.create).toHaveBeenCalledTimes(1);
        });

        it('should throw ConflictException if user with email already exists (code 11000)', async () => {
            // Simulation de l'erreur MongoDB duplicate key
            const mongoError = { code: 11000 };
            mockUserService.create.mockRejectedValue(mongoError);

            await expect(controller.create(createUserDto)).rejects.toThrow(
                ConflictException,
            );

            // Vérification optionnelle du message
            await expect(controller.create(createUserDto)).rejects.toThrow(
                `User with email ${createUserDto.email} already exists`,
            );
        });

        it('should propagate other errors', async () => {
            const genericError = new Error('Database connection failed');
            mockUserService.create.mockRejectedValue(genericError);

            await expect(controller.create(createUserDto)).rejects.toThrow(
                genericError,
            );
        });
    });

    describe('banUser', () => {
        it('should ban a user successfully', async () => {
            mockUserService.findOne.mockResolvedValue(mockUser);
            mockUserService.banUser.mockResolvedValue(true);

            const result = await controller.banUser(userId.toString());

            expect(result).toEqual({ success: true });
            expect(mockUserService.findOne).toHaveBeenCalledWith(userId.toString());
            expect(mockUserService.banUser).toHaveBeenCalledWith(userId.toString());
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockUserService.findOne.mockResolvedValue(null);

            await expect(controller.banUser('non-existent-id')).rejects.toThrow(
                NotFoundException,
            );
            await expect(controller.banUser('non-existent-id')).rejects.toThrow(
                'User with id non-existent-id not found',
            );
            expect(mockUserService.findOne).toHaveBeenCalledWith('non-existent-id');
            expect(mockUserService.banUser).not.toHaveBeenCalled();
        });

        it('should return success false if user exists but ban operation fails', async () => {
            mockUserService.findOne.mockResolvedValue(mockUser);
            mockUserService.banUser.mockResolvedValue(false);

            const result = await controller.banUser(userId.toString());

            expect(result).toEqual({ success: false });
            expect(mockUserService.findOne).toHaveBeenCalledWith(userId.toString());
            expect(mockUserService.banUser).toHaveBeenCalledWith(userId.toString());
        });
    });

    describe('unbanUser', () => {
        it('should unban a user successfully', async () => {
            mockUserService.findOne.mockResolvedValue(mockUser);
            mockUserService.unbanUser.mockResolvedValue(true);

            const result = await controller.unbanUser(userId.toString());

            expect(result).toEqual({ success: true });
            expect(mockUserService.findOne).toHaveBeenCalledWith(userId.toString());
            expect(mockUserService.unbanUser).toHaveBeenCalledWith(userId.toString());
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockUserService.findOne.mockResolvedValue(null);

            await expect(controller.unbanUser('non-existent-id')).rejects.toThrow(
                NotFoundException,
            );
            await expect(controller.unbanUser('non-existent-id')).rejects.toThrow(
                'User with id non-existent-id not found',
            );
            expect(mockUserService.findOne).toHaveBeenCalledWith('non-existent-id');
            expect(mockUserService.unbanUser).not.toHaveBeenCalled();
        });

        it('should return success false if user exists but unban operation fails', async () => {
            mockUserService.findOne.mockResolvedValue(mockUser);
            mockUserService.unbanUser.mockResolvedValue(false);

            const result = await controller.unbanUser(userId.toString());

            expect(result).toEqual({ success: false });
            expect(mockUserService.findOne).toHaveBeenCalledWith(userId.toString());
            expect(mockUserService.unbanUser).toHaveBeenCalledWith(userId.toString());
        });
    });
});
