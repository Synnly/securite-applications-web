import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from '../user/user.schema';
import { Post } from '../post/post.schema';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
    /**
     * Unique MongoDB identifier of the comment
     */
    _id: Types.ObjectId;

    /**
     * Comment's text content
     */
    @Prop({ required: true })
    text: string;

    /**
     * The post to which this comment belongs
     */
    @Prop({ required: true, type: Types.ObjectId, ref: 'Post' })
    post: Post;

    /**
     * Comment's author
     */
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    author: User;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
