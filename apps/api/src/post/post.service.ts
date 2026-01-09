import { Injectable, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostDocument } from './post.schema';
import { CreatePostDto } from './dto/createPost.dto';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    ) {}

    /**
     * Finds all posts in the database.
     * @returns A promise that resolves to an array of Post documents.
     */
    async findAll(): Promise<PostDocument[]> {
        return this.postModel.find().exec();
    }

    /**
     * Finds a single post by its ID.
     * @param id The ID of the post to find.
     * @returns A promise that resolves to the Post document or null if not found.
     */
    async findOneById(id: string): Promise<PostDocument | null> {
        return this.postModel.findById(id).exec();
    }

    /**
     * Creates a new post in the database.
     * @param dto The data transfer object containing post creation data.
     * @returns A promise that resolves when the post is created.
     */
    async create(dto: CreatePostDto): Promise<void> {
        await this.postModel.create({ ...dto });
    }

    /**
     * Deletes a post by its ID.
     * @param id The ID of the post to delete.
     * @returns A promise that resolves when the post is deleted.
     */
    async deleteById(id: string): Promise<void> {
        await this.postModel.findByIdAndDelete(id).exec();
    }
}
