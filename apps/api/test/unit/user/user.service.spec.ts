import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../src/user/user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../../src/user/user.schema';
import { Role } from '../../../src/common/roles/roles.enum';
import { CreateUserDto } from '../../../src/user/dto/createUser.dto';
import { Types } from 'mongoose';

describe('UserService', () => {
    let service: UserService;
    let mockUserModel: any;
    const userId = new Types.ObjectId('507f1f77bcf86cd799439011');

    const mockUser = {
        _id: userId,
        username: 'testuser',
        role: Role.USER,
        password: 'hashedpassword',
    };

    beforeEach(async () => {
        mockUserModel = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of users that are not soft-deleted', async () => {
            const expectedUsers = [mockUser];
            mockUserModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(expectedUsers),
            });

            const result = await service.findAll();

            expect(result).toEqual(expectedUsers);
            expect(mockUserModel.find).toHaveBeenCalledWith({
                deletedAt: { $exists: false },
            });
            expect(mockUserModel.find).toHaveBeenCalledTimes(1);
        });

        it('should return an empty array when no users exist', async () => {
            mockUserModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            });

            const result = await service.findAll();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should propagate error if database find fails', async () => {
            const error = new Error('Database connection error');
            mockUserModel.find.mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });

            await expect(service.findAll()).rejects.toThrow(error);
        });
    });

    describe('findOne', () => {
        it('should return a user if found and not soft-deleted', async () => {
            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUser),
            });

            const result = await service.findOne(userId.toString());

            expect(result).toEqual(mockUser);
            expect(mockUserModel.findOne).toHaveBeenCalledWith({
                _id: userId.toString(),
                deletedAt: { $exists: false },
            });
        });

        it('should return null if user is not found', async () => {
            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await service.findOne('unknown-id');

            expect(result).toBeNull();
        });

        it('should propagate error if database findOne fails', async () => {
            const error = new Error('Database error');
            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });

            await expect(service.findOne('some-id')).rejects.toThrow(error);
        });
    });

    describe('create', () => {
        it('should create a new user successfully', async () => {
            const createUserDto: CreateUserDto = {
                username: 'newuser',
                password: 'password123',
                role: Role.USER,
            };

            mockUserModel.create.mockResolvedValue(mockUser);

            await service.create(createUserDto);

            expect(mockUserModel.create).toHaveBeenCalledWith(
                expect.objectContaining(createUserDto),
            );
            expect(mockUserModel.create).toHaveBeenCalledTimes(1);
        });

        it('should propagate error if database creation fails', async () => {
            const createUserDto: CreateUserDto = {
                username: 'erroruser',
                password: 'password123',
                role: Role.USER,
            };
            const error = new Error('Database error');
            mockUserModel.create.mockRejectedValue(error);

            await expect(service.create(createUserDto)).rejects.toThrow(error);
        });
    });
});
