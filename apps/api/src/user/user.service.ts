import { ConflictException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { Role } from 'src/common/roles/roles.enum';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    /**
     * Finds all users that are not soft-deleted.
     * @returns A promise that resolves to an array of User documents.
     */
    async findAll(): Promise<User[]> {
        return this.userModel.find({ deletedAt: { $exists: false } }).exec();
    }

    /**
     * Finds a single user by ID if not soft-deleted.
     * @param id The ID of the user to find.
     * @returns A promise that resolves to the User document or null if not found.
     */
    async findOne(id: string): Promise<User | null> {
        return this.userModel
            .findOne({ _id: id, deletedAt: { $exists: false } })
            .exec();
    }

    /**
     * Creates a new user in the database.
     * @param dto The data transfer object containing user creation data.
     * @returns A promise that resolves when the user is created.
     * @throws ConflictException if a user with the same email already exists.
     */
    async create(dto: CreateUserDto): Promise<void> {
        const existingUser = await this.userModel.findOne({ email: dto.email });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }
        await this.userModel.create({ ...dto });
    }

    /**
     * Counts the number of users with a specific role that are not soft-deleted.
     * @param role The role to filter users by.
     * @returns A promise that resolves to the count of users with the specified role.
     */
    async countByRole(role: Role): Promise<number> {
        return this.userModel
            .countDocuments({ role, deletedAt: { $exists: false } })
            .exec();
    }

    /**
     * Bans a user by setting its deletedAt field
     * @param userId The user identifier
     * @returns A promise that resolves to true if the user was successfully banned, false otherwise
     */
    async banUser(userId: string): Promise<boolean> {
        const result = await this.userModel.updateOne(
            { _id: userId },
            { $set: { deletedAt: new Date() } },
        ).exec();
        return result.modifiedCount > 0;
    }

}
