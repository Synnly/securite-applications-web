import { Expose, Transform, Type } from 'class-transformer';
import { UserDto } from '../../user/dto/user.dto';

export class PostDto {
    /**
     * Unique identifier for the post
     */
    @Transform((params) => params.obj._id)
    @Expose()
    id: string;

    /**
     * Title of the post
     */
    @Expose()
    title: string;

    /**
     * Body content of the post
     */
    @Expose()
    body: string;

    /**
     * Author of the post
     */
    @Expose()
    @Type(() => UserDto)
    author: UserDto;

    /**
     * Timestamp when the post was created
     */
    @Expose()
    createdAt: Date;

    constructor(post?: Partial<PostDto>) {
        Object.assign(this, post);
    }
}
