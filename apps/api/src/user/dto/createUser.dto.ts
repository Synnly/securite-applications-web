import { IsNotEmpty, IsEnum, IsStrongPassword } from 'class-validator';
import { Role } from '../../common/roles/roles.enum';

/**
 * Data Transfer Object for user registration
 */
export class CreateUserDto {
    /**
     * User's username
     */
    @IsNotEmpty()
    username: string;

    /**
     * User's password for authentication
     *
     * The password will be automatically hashed using bcrypt before storage
     * via the User schema pre-save hook.
     */
    @IsNotEmpty()
    @IsStrongPassword({ minLength: 8, minUppercase: 1, minLowercase: 1, minNumbers: 1, minSymbols: 1 })
    password: string;

    /**
     * User's role in the system
     * @see {@link Role} for complete role definitions
     */
    @IsEnum(Role)
    role: Role;
}
