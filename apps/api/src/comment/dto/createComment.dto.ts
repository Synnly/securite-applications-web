import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
    /**
     * Content of the comment
     */
    @IsString()
    @IsNotEmpty()
    text: String;
}
