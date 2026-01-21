import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import { Post, PostDocument } from '../post/post.schema';
import { Comment, CommentDocument } from '../comment/comment.schema';
import { StatDto } from './dto/stat.dto';

@Injectable()
export class StatService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        @InjectModel(Comment.name)
        private readonly commentModel: Model<CommentDocument>,
    ) {}

    async getStats(): Promise<StatDto> {
        const [users, posts, comments] = await Promise.all([
            this.userModel.countDocuments({ deletedAt: null }).exec(),
            this.postModel.countDocuments({ deletedAt: null }).exec(),
            this.commentModel.countDocuments().exec(),
        ]);

        return { users, posts, comments };
    }
}
