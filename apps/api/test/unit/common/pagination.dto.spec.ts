import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from '../../../src/common/pagination/dto/pagination.dto';

describe('PaginationDto', () => {
    it('should be defined', () => {
        const dto = new PaginationDto();
        expect(dto).toBeDefined();
    });

    describe('Default values', () => {
        it('should have default page = 1', () => {
            const dto = new PaginationDto();
            expect(dto.page).toBe(1);
        });

        it('should have default limit = 10', () => {
            const dto = new PaginationDto();
            expect(dto.limit).toBe(10);
        });
    });

    describe('Validation', () => {
        it('should accept valid page and limit', async () => {
            const dto = plainToInstance(PaginationDto, {
                page: '2',
                limit: '20',
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
            expect(dto.page).toBe(2);
            expect(dto.limit).toBe(20);
        });

        it('should transform string to number', async () => {
            const dto = plainToInstance(PaginationDto, {
                page: '5',
                limit: '25',
            });

            expect(typeof dto.page).toBe('number');
            expect(typeof dto.limit).toBe('number');
            expect(dto.page).toBe(5);
            expect(dto.limit).toBe(25);
        });

        it('should use defaults when fields are missing', async () => {
            const dto = plainToInstance(PaginationDto, {});

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
            expect(dto.page).toBe(1);
            expect(dto.limit).toBe(10);
        });
    });

    describe('Page validation', () => {
        it('should reject page < 1', async () => {
            const dto = plainToInstance(PaginationDto, { page: '0' });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('page');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should reject negative page', async () => {
            const dto = plainToInstance(PaginationDto, { page: '-1' });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('page');
        });

        it('should reject non-integer page', async () => {
            const dto = plainToInstance(PaginationDto, { page: '1.5' });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('page');
            expect(errors[0].constraints).toHaveProperty('isInt');
        });

        it('should reject non-numeric page', async () => {
            const dto = plainToInstance(PaginationDto, { page: 'abc' });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('page');
        });

        it('should accept page = 1', async () => {
            const dto = plainToInstance(PaginationDto, { page: '1' });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
            expect(dto.page).toBe(1);
        });

        it('should accept large page numbers', async () => {
            const dto = plainToInstance(PaginationDto, { page: '1000' });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
            expect(dto.page).toBe(1000);
        });
    });

    describe('Limit validation', () => {
        it('should reject limit < 1', async () => {
            const dto = plainToInstance(PaginationDto, { limit: '0' });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('limit');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should reject limit > 100', async () => {
            const dto = plainToInstance(PaginationDto, { limit: '101' });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('limit');
            expect(errors[0].constraints).toHaveProperty('max');
        });

        it('should reject negative limit', async () => {
            const dto = plainToInstance(PaginationDto, { limit: '-5' });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('limit');
        });

        it('should reject non-integer limit', async () => {
            const dto = plainToInstance(PaginationDto, { limit: '10.5' });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('limit');
            expect(errors[0].constraints).toHaveProperty('isInt');
        });

        it('should reject non-numeric limit', async () => {
            const dto = plainToInstance(PaginationDto, { limit: 'xyz' });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('limit');
        });

        it('should accept limit = 1', async () => {
            const dto = plainToInstance(PaginationDto, { limit: '1' });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
            expect(dto.limit).toBe(1);
        });

        it('should accept limit = 100', async () => {
            const dto = plainToInstance(PaginationDto, { limit: '100' });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
            expect(dto.limit).toBe(100);
        });

        it('should accept limit = 50', async () => {
            const dto = plainToInstance(PaginationDto, { limit: '50' });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
            expect(dto.limit).toBe(50);
        });
    });

    describe('Combined validation', () => {
        it('should validate both page and limit correctly', async () => {
            const dto = plainToInstance(PaginationDto, {
                page: '3',
                limit: '25',
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
            expect(dto.page).toBe(3);
            expect(dto.limit).toBe(25);
        });

        it('should reject both invalid page and limit', async () => {
            const dto = plainToInstance(PaginationDto, {
                page: '0',
                limit: '200',
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(2);

            const pageError = errors.find((e) => e.property === 'page');
            const limitError = errors.find((e) => e.property === 'limit');

            expect(pageError).toBeDefined();
            expect(limitError).toBeDefined();
        });

        it('should handle partial input with one valid field', async () => {
            const dto = plainToInstance(PaginationDto, { page: '5' });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
            expect(dto.page).toBe(5);
            expect(dto.limit).toBe(10); // default
        });

        it('should handle partial input with another valid field', async () => {
            const dto = plainToInstance(PaginationDto, { limit: '30' });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
            expect(dto.page).toBe(1); // default
            expect(dto.limit).toBe(30);
        });
    });

    describe('Edge cases', () => {
        it('should handle empty strings', async () => {
            const dto = plainToInstance(PaginationDto, {
                page: '',
                limit: '',
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should use defaults when values are omitted', async () => {
            const dto = plainToInstance(PaginationDto, {});

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
            expect(dto.page).toBe(1);
            expect(dto.limit).toBe(10);
        });
    });
});
