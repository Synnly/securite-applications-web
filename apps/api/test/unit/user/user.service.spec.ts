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
        email: 'testuser',
        role: Role.USER,
        password: 'hashedpassword',
    };

    beforeEach(async () => {
        mockUserModel = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updateOne: jest.fn(),
            countDocuments: jest.fn(),
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
        it('should return an array of users with USER role that are not soft-deleted', async () => {
            const expectedUsers = [mockUser];
            mockUserModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(expectedUsers),
            });

            const result = await service.findAll();

            expect(result).toEqual(expectedUsers);
            expect(mockUserModel.find).toHaveBeenCalledWith({
                deletedAt: { $exists: false },
                role: Role.USER,
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
                email: 'newuser',
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
                email: 'erroruser',
                password: 'password123',
                role: Role.USER,
            };
            const error = new Error('Database error');
            mockUserModel.create.mockRejectedValue(error);

            await expect(service.create(createUserDto)).rejects.toThrow(error);
        });
    });

    describe('banUser', () => {
        it('should ban a user successfully by setting bannedAt field', async () => {
            const mockResult = {
                modifiedCount: 1,
                matchedCount: 1,
            };
            mockUserModel.updateOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockResult),
            });

            const result = await service.banUser(userId.toString());

            expect(result).toBe(true);
            expect(mockUserModel.updateOne).toHaveBeenCalledWith(
                { _id: userId.toString() },
                { $set: { bannedAt: expect.any(Date) } },
            );
            expect(mockUserModel.updateOne).toHaveBeenCalledTimes(1);
        });

        it('should return false if user was not found', async () => {
            const mockResult = {
                modifiedCount: 0,
                matchedCount: 0,
            };
            mockUserModel.updateOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockResult),
            });

            const result = await service.banUser('non-existent-id');

            expect(result).toBe(false);
            expect(mockUserModel.updateOne).toHaveBeenCalledWith(
                { _id: 'non-existent-id' },
                { $set: { bannedAt: expect.any(Date) } },
            );
        });

        it('should return false if user was already banned (not modified)', async () => {
            const mockResult = {
                modifiedCount: 0,
                matchedCount: 1,
            };
            mockUserModel.updateOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockResult),
            });

            const result = await service.banUser(userId.toString());

            expect(result).toBe(false);
        });

        it('should propagate error if database update fails', async () => {
            const error = new Error('Database update error');
            mockUserModel.updateOne.mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });

            await expect(service.banUser(userId.toString())).rejects.toThrow(
                error,
            );
        });
    });

    describe('unbanUser', () => {
        it('should unban a user successfully by removing bannedAt field', async () => {
            const mockResult = {
                modifiedCount: 1,
                matchedCount: 1,
            };
            mockUserModel.updateOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockResult),
            });

            const result = await service.unbanUser(userId.toString());

            expect(result).toBe(true);
            expect(mockUserModel.updateOne).toHaveBeenCalledWith(
                { _id: userId.toString() },
                { $unset: { bannedAt: '' } },
            );
            expect(mockUserModel.updateOne).toHaveBeenCalledTimes(1);
        });

        it('should return false if user was not found', async () => {
            const mockResult = {
                modifiedCount: 0,
                matchedCount: 0,
            };
            mockUserModel.updateOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockResult),
            });

            const result = await service.unbanUser('non-existent-id');

            expect(result).toBe(false);
            expect(mockUserModel.updateOne).toHaveBeenCalledWith(
                { _id: 'non-existent-id' },
                { $unset: { bannedAt: '' } },
            );
        });

        it('should return false if user was already unbanned (not modified)', async () => {
            const mockResult = {
                modifiedCount: 0,
                matchedCount: 1,
            };
            mockUserModel.updateOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockResult),
            });

            const result = await service.unbanUser(userId.toString());

            expect(result).toBe(false);
        });

        it('should propagate error if database update fails', async () => {
            const error = new Error('Database update error');
            mockUserModel.updateOne.mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });

            await expect(service.unbanUser(userId.toString())).rejects.toThrow(
                error,
            );
        });
    });
});
