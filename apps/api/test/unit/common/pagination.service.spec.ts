import { Test, TestingModule } from '@nestjs/testing';
import { PaginationService } from '../../../src/common/pagination/pagination.service';
import { Model } from 'mongoose';

describe('PaginationService', () => {
    let service: PaginationService;
    let mockModel: any;

    beforeEach(async () => {
        // Mock Mongoose model
        const mockExec = jest.fn();
        const mockPopulate = jest.fn().mockReturnThis();
        const mockSkip = jest.fn().mockReturnThis();
        const mockLimit = jest.fn().mockReturnThis();
        const mockLean = jest.fn().mockReturnValue(mockExec);

        mockModel = {
            find: jest.fn().mockReturnValue({
                skip: mockSkip,
                limit: mockLimit,
                populate: mockPopulate,
                lean: mockLean,
            }),
            countDocuments: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [PaginationService],
        }).compile();

        service = module.get<PaginationService>(PaginationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('paginate', () => {
        it('should return paginated results for page 1', async () => {
            const mockItems = [
                { _id: '1', title: 'Post 1' },
                { _id: '2', title: 'Post 2' },
                { _id: '3', title: 'Post 3' },
            ];
            const total = 25;

            mockModel.find().lean.mockResolvedValue(mockItems);
            mockModel.countDocuments.mockResolvedValue(total);

            const result = await service.paginate(mockModel, 1, 10);

            expect(result).toEqual({
                data: mockItems,
                total: 25,
                page: 1,
                limit: 10,
                totalPages: 3,
                hasNext: true,
                hasPrev: false,
            });

            expect(mockModel.find).toHaveBeenCalledWith({});
            expect(mockModel.find().skip).toHaveBeenCalledWith(0);
            expect(mockModel.find().limit).toHaveBeenCalledWith(10);
            expect(mockModel.countDocuments).toHaveBeenCalledWith({});
        });

        it('should return paginated results for page 2', async () => {
            const mockItems = [{ _id: '11', title: 'Post 11' }];
            const total = 25;

            mockModel.find().lean.mockResolvedValue(mockItems);
            mockModel.countDocuments.mockResolvedValue(total);

            const result = await service.paginate(mockModel, 2, 10);

            expect(result).toEqual({
                data: mockItems,
                total: 25,
                page: 2,
                limit: 10,
                totalPages: 3,
                hasNext: true,
                hasPrev: true,
            });

            expect(mockModel.find().skip).toHaveBeenCalledWith(10);
            expect(mockModel.find().limit).toHaveBeenCalledWith(10);
        });

        it('should return paginated results for last page', async () => {
            const mockItems = [
                { _id: '21', title: 'Post 21' },
                { _id: '22', title: 'Post 22' },
            ];
            const total = 22;

            mockModel.find().lean.mockResolvedValue(mockItems);
            mockModel.countDocuments.mockResolvedValue(total);

            const result = await service.paginate(mockModel, 3, 10);

            expect(result).toEqual({
                data: mockItems,
                total: 22,
                page: 3,
                limit: 10,
                totalPages: 3,
                hasNext: false,
                hasPrev: true,
            });
        });

        it('should handle empty results', async () => {
            mockModel.find().lean.mockResolvedValue([]);
            mockModel.countDocuments.mockResolvedValue(0);

            const result = await service.paginate(mockModel, 1, 10);

            expect(result).toEqual({
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
            });
        });

        it('should apply populate options when provided', async () => {
            const mockItems = [{ _id: '1', title: 'Post 1' }];
            mockModel.find().lean.mockResolvedValue(mockItems);
            mockModel.countDocuments.mockResolvedValue(10);

            const populateOptions = [
                { path: 'author', select: '_id email' },
                { path: 'comments' },
            ];

            await service.paginate(mockModel, 1, 10, populateOptions);

            expect(mockModel.find().populate).toHaveBeenCalledTimes(2);
            expect(mockModel.find().populate).toHaveBeenCalledWith(
                populateOptions[0],
            );
            expect(mockModel.find().populate).toHaveBeenCalledWith(
                populateOptions[1],
            );
        });

        it('should apply filter when provided', async () => {
            const mockItems = [{ _id: '1', title: 'Post 1' }];
            mockModel.find().lean.mockResolvedValue(mockItems);
            mockModel.countDocuments.mockResolvedValue(5);

            const filter = { author: '507f1f77bcf86cd799439011' };

            await service.paginate(mockModel, 1, 10, undefined, filter);

            expect(mockModel.find).toHaveBeenCalledWith(filter);
            expect(mockModel.countDocuments).toHaveBeenCalledWith(filter);
        });

        it('should handle custom page sizes', async () => {
            const mockItems = [{ _id: '1' }, { _id: '2' }];
            mockModel.find().lean.mockResolvedValue(mockItems);
            mockModel.countDocuments.mockResolvedValue(100);

            const result = await service.paginate(mockModel, 1, 50);

            expect(result.limit).toBe(50);
            expect(result.totalPages).toBe(2);
            expect(mockModel.find().limit).toHaveBeenCalledWith(50);
        });

        it('should calculate totalPages correctly with exact division', async () => {
            const mockItems = [];
            mockModel.find().lean.mockResolvedValue(mockItems);
            mockModel.countDocuments.mockResolvedValue(30);

            const result = await service.paginate(mockModel, 1, 10);

            expect(result.totalPages).toBe(3);
        });

        it('should calculate totalPages correctly with remainder', async () => {
            const mockItems = [];
            mockModel.find().lean.mockResolvedValue(mockItems);
            mockModel.countDocuments.mockResolvedValue(25);

            const result = await service.paginate(mockModel, 1, 10);

            expect(result.totalPages).toBe(3);
        });
    });
});
