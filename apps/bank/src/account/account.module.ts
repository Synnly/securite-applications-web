import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './account.schema';
import { Payment, PaymentSchema } from './payment.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Account.name, schema: AccountSchema },
            { name: Payment.name, schema: PaymentSchema },
        ]),
    ],
    providers: [AccountService],
    controllers: [AccountController],
    exports: [AccountService],
})
export class AccountModule {}
