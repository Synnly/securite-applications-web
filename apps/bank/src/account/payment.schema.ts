import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Account } from './account.schema';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
    /**
     * Unique MongoDB identifier of the post
     */
    _id: Types.ObjectId;

    /**
     * Payment amount
     */
    @Prop({ required: true })
    amount: number;

    /**
     * Associated account for the payment
     */
    @Prop({ required: true, type: Types.ObjectId, ref: 'Account' })
    account: Account;

    /**
     * Date when the payment was claimed
     */
    @Prop({ required: true })
    claimDate: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
