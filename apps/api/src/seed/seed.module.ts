import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';
import { CommentModule } from '../comment/comment.module';

@Module({
    imports: [UserModule, PostModule, CommentModule],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule {}
