import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

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
    cardNumber: number;

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

    try {
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
