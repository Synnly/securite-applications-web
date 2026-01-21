import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatService } from './stat.service';
import { StatController } from './stat.controller';
import { User, UserSchema } from '../user/user.schema';
import { Post, PostSchema } from '../post/post.schema';
import { Comment, CommentSchema } from '../comment/comment.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Post.name, schema: PostSchema },
            { name: Comment.name, schema: CommentSchema },
        ]),
    ],
    providers: [StatService],
    controllers: [StatController],
})
export class StatModule {}
