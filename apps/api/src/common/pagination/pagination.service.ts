import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PaginationResult } from './dto/paginationResult';

/**
 * Utility service that provides generic pagination support for Mongoose models.
 *
 * The service exposes a single `paginate` method which performs a paginated
 * query, optionally applies sorting and population, and returns the results
 * together with pagination metadata.
 */
@Injectable()
export class PaginationService {
    /**
     * Execute a paginated query against a Mongoose model.
     *
     * @typeParam T - Document type stored in the model
     * @param model - The Mongoose model to query
     * @param page - Page number (1-based)
     * @param limit - Number of items per page
     * @param populate - Optional array of populate options (paths or objects)
     * @param filter - Optional filter object for the query
     * @returns A `PaginationResult<T>` containing page items and metadata
     */
    async paginate<T, TQueryHelpers = {}, TMethods = {}, TVirtuals = {}>(
        model: Model<T, TQueryHelpers, TMethods, TVirtuals>,
        page: number,
        limit: number,
        populate?: Array<string | Record<string, any>>,
        filter: Record<string, any> = {},
    ): Promise<PaginationResult<T>> {
        const skip = (page - 1) * limit;
        const query = model.find(filter).skip(skip).limit(limit);

        if (populate) populate.forEach((p) => query.populate(p as any));

        const [items, total] = await Promise.all([
            query.lean<T[]>(),
            model.countDocuments(filter),
        ]);
        return {
            data: items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
}
