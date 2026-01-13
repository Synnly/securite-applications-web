import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './post.schema';
import { UserModule } from '../user/user.module';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
        UserModule,
    ],
    controllers: [PostController],
    providers: [PostService, PaginationService],
    exports: [PostService],
})
export class PostModule {}
