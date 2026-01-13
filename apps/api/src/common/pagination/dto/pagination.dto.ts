import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

/**
 * DTO for pagination and filtering posts and comments.
 * Enforces page >= 1 and limit between 1 and 100.
 * Supports search, filtering by title/body/text, and sorting.
 */
export class PaginationDto {
    /**
     * Page number (1-based)
     * @example 1
     */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    /**
     * Number of items per page
     * @example 10
     */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit = 10;
}
