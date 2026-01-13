import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for user authentication
 * @see {@link User.comparePassword} for password verification method
 */
export class LoginDto {
    /**
     * User's email for authentication
     */
    @IsNotEmpty()
    @IsEmail()
    email: string;

    /**
     * User's password for authentication
     *
     * This password will be compared with the stored bcrypt hash
     * to authenticate the user.
     */
    @IsNotEmpty()
    password: string;
}
