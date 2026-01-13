import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentDocument } from './comment.schema';
import { CreateCommentDto } from './dto/createComment.dto';
import { PostService } from '../post/post.service';
import { UserService } from '../user/user.service';
import { PaginationResult } from 'src/common/pagination/dto/paginationResult';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel('Comment')
        private readonly commentModel: Model<CommentDocument>,
        private readonly postService: PostService,
        private readonly userService: UserService,
        private readonly paginationService: PaginationService,
    ) {}

    /**
     * Finds all comments by post ID.
     * @param postId The ID of the post
     * @returns A promise that resolves to an array of Comment documents.
     * @throws NotFoundException if the post does not exist
     */
    async findAllByPostId(postId: string, query: PaginationDto): Promise<PaginationResult<CommentDocument>> {
        const post = await this.postService.findOneById(postId);
        if (!post)
            throw new NotFoundException(`Post of id ${postId} not found`);

        return this.paginationService.paginate(
            this.commentModel,
            query.page,
            query.limit,
            [{ path: 'author', select: '_id email' }],
            { deletedAt: null, post: postId },
        );
    }

    /**
     * Creates a new comment associated with a specific post and author.
     * @param dto Data transfer object containing comment creation data
     * @param authorId The ID of the author creating the comment
     * @param postId The ID of the post to which the comment belongs
     * @returns A promise that resolves when the comment is created
     * @throws NotFoundException if the author or post does not exist
     */
    async create(
        dto: CreateCommentDto,
        authorId: string,
        postId: string,
    ): Promise<void> {
        const user = await this.userService.findOne(authorId);
        if (!user)
            throw new NotFoundException(`User of id ${authorId} not found`);

        const post = await this.postService.findOneById(postId);
        if (!post)
            throw new NotFoundException(`Post of id ${postId} not found`);

        const comment = new this.commentModel({
            ...dto,
            author: user,
            post: post,
        });
        await comment.save();
    }
}
