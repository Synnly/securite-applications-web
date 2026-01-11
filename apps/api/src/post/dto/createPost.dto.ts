import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
    /**
     * Title of the post
     */
    @IsNotEmpty()
    @IsString()
    title: string;

    /**
     * Body content of the post
     */
    @IsNotEmpty()
    @IsString()
    body: string;
}
