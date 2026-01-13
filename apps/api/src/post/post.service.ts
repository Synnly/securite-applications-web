import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { CreatePostDto } from './dto/createPost.dto';
import { UserService } from '../user/user.service';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { PaginationResult } from 'src/common/pagination/dto/paginationResult';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        private readonly userService: UserService,
        private readonly paginationService: PaginationService,
    ) {}

    /**
     * Finds all active posts in the database.
     * @returns A promise that resolves to an array of Post documents.
     */
    async findAll(query: PaginationDto): Promise<PaginationResult<PostDocument>> {
        return this.paginationService.paginate(
            this.postModel,
            query.page,
            query.limit,
            [{ path: 'author', select: '_id email' }],
            { deletedAt: null },
        );
    }

    /**
     * Finds a single active post by its ID.
     * @param id The ID of the post to find.
     * @returns A promise that resolves to the Post document or null if not found.
     */
    async findOneById(id: string): Promise<PostDocument | null> {
        return this.postModel
            .findOne({ _id: id, deletedAt: null })
            .populate('author', '_id email')
            .exec();
    }

    /**
     * Creates a new post in the database.
     * @param dto The data transfer object containing post creation data.
     * @param authorId The ID of the author creating the post.
     * @returns A promise that resolves when the post is created.
     */
    async create(dto: CreatePostDto, authorId: string): Promise<void> {
        const author = await this.userService.findOne(authorId);
        if (!author) {
            throw new NotFoundException(`No user found with id ${authorId}`);
        }

        const post = new this.postModel({
            ...dto,
            author: author._id,
        });
        await post.save();
    }

    /**
     * Soft deletes a post by its ID.
     * @param id The ID of the post to delete.
     * @returns A promise that resolves when the post is deleted.
     */
    async deleteById(id: string): Promise<void> {
        await this.postModel
            .findByIdAndUpdate(id, { deletedAt: new Date() })
            .exec();
    }
}
