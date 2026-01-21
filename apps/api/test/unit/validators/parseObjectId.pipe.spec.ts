import { BadRequestException } from '@nestjs/common';
import { ParseObjectIdPipe } from '../../../src/validators/parseObjectId.pipe';
import { Types } from 'mongoose';

describe('ParseObjectIdPipe', () => {
    let pipe: ParseObjectIdPipe;

    beforeEach(() => {
        pipe = new ParseObjectIdPipe();
    });

    describe('transform', () => {
        it('should transform a valid ObjectId string to Types.ObjectId', () => {
            const validId = '507f1f77bcf86cd799439011';
            const result = pipe.transform(validId);

            expect(result).toBeInstanceOf(Types.ObjectId);
            expect(result.toString()).toBe(validId);
        });

        it('should throw BadRequestException when value is empty string', () => {
            expect(() => pipe.transform('')).toThrow(BadRequestException);
            expect(() => pipe.transform('')).toThrow('ObjectId is required');
        });

        it('should throw BadRequestException when value is null', () => {
            expect(() => pipe.transform(null as any)).toThrow(BadRequestException);
            expect(() => pipe.transform(null as any)).toThrow('ObjectId is required');
        });

        it('should throw BadRequestException when value is undefined', () => {
            expect(() => pipe.transform(undefined as any)).toThrow(BadRequestException);
            expect(() => pipe.transform(undefined as any)).toThrow('ObjectId is required');
        });

        it('should throw BadRequestException when ObjectId is invalid format', () => {
            const invalidId = 'not-a-valid-objectid';
            
            expect(() => pipe.transform(invalidId)).toThrow(BadRequestException);
            expect(() => pipe.transform(invalidId)).toThrow(`Invalid ObjectId: ${invalidId}`);
        });

        it('should throw BadRequestException when ObjectId has wrong length', () => {
            const invalidId = '123';
            
            expect(() => pipe.transform(invalidId)).toThrow(BadRequestException);
            expect(() => pipe.transform(invalidId)).toThrow(`Invalid ObjectId: ${invalidId}`);
        });

        it('should throw BadRequestException when ObjectId contains invalid characters', () => {
            const invalidId = '507f1f77bcf86cd79943901g'; // 'g' is not a valid hex character
            
            expect(() => pipe.transform(invalidId)).toThrow(BadRequestException);
            expect(() => pipe.transform(invalidId)).toThrow(`Invalid ObjectId: ${invalidId}`);
        });
    });
});
