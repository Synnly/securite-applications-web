import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from './comment.schema';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';
import { Comment } from './comment.schema';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema },
        ]),
        UserModule,
        PostModule,
    ],
    providers: [CommentService, PaginationService],
    controllers: [CommentController],
    exports: [CommentService],
})
export class CommentModule {}
