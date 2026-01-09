import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../user/user.schema';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
    /**
     * Unique MongoDB identifier of the post
     */
    _id: Types.ObjectId;

    /**
     * Post's title
     */
    @Prop({ required: true })
    title: string;

    /**
     * Post's body
     */
    @Prop({ required: true })
    body: string;

    /**
     * Post's author
     */
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    author: User;
}

export const PostSchema = SchemaFactory.createForClass(Post);
