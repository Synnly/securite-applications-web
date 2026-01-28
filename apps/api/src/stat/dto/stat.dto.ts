import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class StatDto {
    @Expose()
    users: number;

    @Expose()
    posts: number;

    @Expose()
    comments: number;
}
