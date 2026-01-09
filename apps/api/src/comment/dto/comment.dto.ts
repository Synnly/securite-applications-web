import { Expose, Transform, Type } from 'class-transformer';
import { UserDto } from '../../user/dto/user.dto';

export class CommentDto {
    /**
     * Unique identifier for the comment
     */
    @Transform((params) => params.obj._id)
    @Expose()
    id: number;

    /**
     * Text content of the comment
     */
    @Expose()
    text: string;

    /**
     * Author of the comment
     */
    @Expose()
    @Type(() => UserDto)
    author: UserDto;

    /**
     * Timestamp when the comment was created
     */
    @Expose()
    createdAt: Date;

    constructor(comment?: Partial<CommentDto>) {
        Object.assign(this, comment);
    }
}
