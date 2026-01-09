import { Expose, Transform } from 'class-transformer';

export class PostDto {
    /**
     * Unique identifier for the post
     */
    @Transform((params) => params.obj._id)
    @Expose()
    id: number;

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
     * Timestamp when the post was created
     */
    @Expose()
    createdAt: Date;
}
