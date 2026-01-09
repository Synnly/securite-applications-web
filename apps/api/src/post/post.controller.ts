import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Req,
    Request,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostDto } from './dto/post.dto';
import { plainToInstance } from 'class-transformer';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CreatePostDto } from './dto/createPost.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    /**
     * Retrieves all posts
     * @returns An array of all posts
     */
    @Get('all')
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<PostDto[]> {
        const posts = await this.postService.findAll();
        return posts.map((post) =>
            plainToInstance(PostDto, post, {
                excludeExtraneousValues: true,
            }),
        );
    }

    /**
     * Retrieves a single post by its ID
     * @param postId The post identifier
     * @returns The post with the specified ID
     * @throws {NotFoundException} if no post exists with the given ID
     */
    @Get('by-id/:postId')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('postId', ParseObjectIdPipe) postId: string,
    ): Promise<PostDto> {
        const post = await this.postService.findOneById(postId);
        if (!post)
            throw new NotFoundException(`Post with id ${postId} not found`);

        return plainToInstance(PostDto, post, {
            excludeExtraneousValues: true,
        });
    }

    /**
     * Creates a new post
     * @param req
     * @param dto The post data for creation
     * @returns A promise that resolves when the post is created
     */
    @UseGuards(AuthGuard)
    @Post()
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
        dto: CreatePostDto,
    ): Promise<void> {
        const id = (req as any).user.sub;
        await this.postService.create(dto, id);
    }

    @Delete(':postId')
    async delete(
        @Param('postId', ParseObjectIdPipe) postId: string,
    ): Promise<void> {
        await this.postService.deleteById(postId);
    }
}
