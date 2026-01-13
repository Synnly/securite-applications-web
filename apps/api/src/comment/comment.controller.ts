import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    Req,
    Request,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDto } from './dto/comment.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '../auth/auth.guard';
import { CreateCommentDto } from './dto/createComment.dto';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { PaginationResult } from 'src/common/pagination/dto/paginationResult';

@Controller('comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    /**
     * Retrieves all comments for a specific post.
     * @param postId The post identifier
     * @returns An array of comments associated with the specified post
     */
    @UseGuards(AuthGuard)
    @Get('by-post/:postId')
    @HttpCode(HttpStatus.OK)
    async findAll(
        @Param('postId', ParseObjectIdPipe) postId: string,
        @Query(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        query: PaginationDto,
    ): Promise<PaginationResult<CommentDto>> {
        const comments = await this.commentService.findAllByPostId(
            postId,
            query,
        );
        return {
            ...comments,
            data: comments.data.map((comment) =>
                plainToInstance(CommentDto, comment, {
                    excludeExtraneousValues: true,
                }),
            ),
        };
    }

    /**
     * Creates a new comment for a specific post.
     * @param req The request object containing user information
     * @param dto The data transfer object for creating a comment
     * @param postId The post identifier
     * @returns A promise that resolves when the comment is created
     */
    @UseGuards(AuthGuard)
    @Post('by-post/:postId')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Req() req: Request,
        @Body(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        dto: CreateCommentDto,
        @Param('postId', ParseObjectIdPipe) postId: string,
    ): Promise<void> {
        const authorId = (req as any).user.sub;
        await this.commentService.create(dto, authorId, postId);
    }
}
