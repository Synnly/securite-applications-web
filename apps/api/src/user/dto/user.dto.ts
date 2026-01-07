import { Types } from "mongoose";
import { Transform, Expose } from "class-transformer";

/**
 * Data Transfer Object for users
 */
export class UserDto {
    @Transform((params) => params.obj._id)
    @Expose()
    _id: Types.ObjectId;

    @Expose()
    username: string;
}