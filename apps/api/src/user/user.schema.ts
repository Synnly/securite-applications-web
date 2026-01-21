import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/roles/roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    /**
     * Unique MongoDB identifier for the user
     */
    _id: Types.ObjectId;

    /**
     * User's email
     */
    @Prop({ required: true, unique: true })
    email: string;

    /**
     * User's hashed password
     */
    @Prop({ required: true })
    password: string;

    /**
     * User's role in the system
     * @see {@link Role} enum for available roles
     */
    @Prop({ required: true, type: String, enum: Role, default: Role.USER })
    role: Role;

    /**
     * Indicates if the user is banned from accessing the system
     */
    @Prop()
    bannedAt?: Date;

    /**
     * Timestamp for soft deletion.
     * If present, the user is considered deleted.
     */
    @Prop()
    deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * Pre-save hook for automatic password hashing
 *
 * Intercepts save operations to hash passwords before storage, ensuring passwords
 * are never stored in plain text. Uses bcrypt with salt rounds of 10.
 *
 * **Behavior:**
 * - Only processes password if it has been modified
 * - Skips hashing if password field is undefined (for partial updates)
 * - Uses bcrypt.genSalt(10) for salt generation
 * - Replaces plain text password with hash in the document
 *
 * **When it triggers:**
 * - New user creation (password is new)
 * - Password update via save() method
 * - Does NOT trigger with findOneAndUpdate() or updateOne()
 *
 * @remarks
 * This is why the update method uses findOne + save instead of findOneAndUpdate
 *
 * @throws Passes any bcrypt errors to the next middleware
 */
UserSchema.pre('save', async function () {
    // Skip if password hasn't been modified
    if (!this.isModified('password')) {
        return;
    }

    // Safety check: verify password exists and is not empty or whitespace before attempting to hash
    if (!this.password || this.password.trim().length === 0) {
        throw new Error('Password cannot be empty');
    }

    try {
        // Generate salt with 10 rounds (good balance of security and performance)
        const salt = await bcrypt.genSalt(10);
        // Hash the password and replace it in the document
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});
