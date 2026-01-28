import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { pbkdf2Sync } from 'crypto';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
    /**
     * Unique MongoDB identifier of the account
     */
    _id: Types.ObjectId;

    /**
     * Card number associated with the account
     */
    @Prop({ required: true, unique: true })
    cardNumber: string;

    /**
     * Expiration date of the card
     * Format: MM/YY
     */
    @Prop({ required: true })
    expirationDate: string;

    /**
     * CVV code of the card
     */
    @Prop({ required: true })
    cvv: string;

    /**
     * Account balance
     */
    @Prop({ required: true, min: 0 })
    balance: number;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

AccountSchema.pre('save', async function () {
    // Safety checks
    if (!this.expirationDate) throw new Error('Expiration date is missing');
    if (!this.cvv) throw new Error('CVV is missing');

    const ITERATIONS = 100000;
    const KEY_LEN = 64;
    const DIGEST = 'sha512';
    const STATIC_SALT = process.env.STATIC_SALT;

    if (!STATIC_SALT) throw new Error('STATIC_SALT is not defined');

    try {
        if (this.isModified('cardNumber')) {
            this.cardNumber = pbkdf2Sync(
                this.cardNumber,
                STATIC_SALT,
                ITERATIONS,
                KEY_LEN,
                DIGEST,
            ).toString('hex');
        }
        if (this.isModified('expirationDate')) {
            this.expirationDate = await bcrypt.hash(
                this.expirationDate,
                await bcrypt.genSalt(10),
            );
        }
        if (this.isModified('cvv')) {
            this.cvv = await bcrypt.hash(this.cvv, await bcrypt.genSalt(10));
        }
    } catch (error) {
        throw error;
    }
});
