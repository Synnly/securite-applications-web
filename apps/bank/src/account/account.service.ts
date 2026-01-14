import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from './account.schema';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';
import * as bcrypt from 'bcrypt';
import { AccountDto } from './dto/account.dto';

@Injectable()
export class AccountService {
    constructor(
        @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    ) {}

    /**
     * Creates a new account with the provided details. The account details are hashed before storage for security.
     * @param dto The account details including card number, expiration date, and CVV.
     * @param balance The initial balance of the account. Must be a non-negative number.
     */
    async createAccount(dto: AccountDto, balance: number): Promise<void> {
        if (balance < 0) {
            throw new BadRequestException('Balance cannot be negative');
        }

        const account = new this.accountModel({
            cardNumber: Number.parseInt(dto.cardNumber),
            expirationDate: dto.expirationDate,
            cvv: dto.cvv,
            balance,
        });
        await account.save();
    }

    /**
     * Processes a payment by deducting the specified amount from the account balance after verifying credentials.
     * @param dto The account credentials including card number, expiration date, and CVV.
     * @param amount The amount to be paid. Must be a positive number.
     * @throws BadRequestException if the credentials are invalid, the account is not found, or there are insufficient funds.
     */
    async pay(dto: AccountDto, amount: number): Promise<PaymentDocument> {
        const account = await this.accountModel.findOne({
            cardNumber: Number.parseInt(dto.cardNumber),
        });
        if (!account) {
            throw new NotFoundException('Account not found');
        }

        const [expMatch, cvvMatch] = await Promise.all([
            bcrypt.compare(dto.expirationDate, account.expirationDate),
            bcrypt.compare(dto.cvv.toString(), account.cvv),
        ]);

        if (!expMatch || !cvvMatch) {
            throw new NotFoundException('Account not found');
        }

        if (account.balance < amount) {
            throw new BadRequestException('Insufficient balance');
        }

        account.balance -= amount;
        await account.save();

        // Log the payment
        const payment = new this.paymentModel({
            account,
            amount,
        });
        await payment.save();

        return payment;
    }

    /**
     * Verifies that a payment exists and has not been yet claimed
     * @param paymentId The payment id
     * @throws{NotFoundException} If the payment does not exist
     * @throws{BadRequestException} If the payment has already been claimed
     */
    async verifyPayment(paymentId: string): Promise<void> {
        const payment = await this.paymentModel.findById(paymentId).exec();

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }
        if (payment.claimDate) {
            throw new BadRequestException('Payment already claimed');
        }
        payment.claimDate = new Date();
        await payment.save();
    }

    /**
     * Seeds the database with predefined accounts if they do not already exist
     */
    async seedAccounts(): Promise<void> {
        const accounts = [
            {
                cardNumber: 1234567812345678,
                expirationDate: '12/25',
                cvv: '123',
                balance: Math.floor(Math.random() * 10000),
            },
            {
                cardNumber: 8765432187654321,
                expirationDate: '11/24',
                cvv: '456',
                balance: Math.floor(Math.random() * 10000),
            },
            {
                cardNumber: 4000000000000002,
                expirationDate: '10/26',
                cvv: '789',
                balance: Math.floor(Math.random() * 10000),
            },
            {
                cardNumber: 4111111111111111,
                expirationDate: '09/27',
                cvv: '321',
                balance: Math.floor(Math.random() * 10000),
            },
            {
                cardNumber: 5555555555554444,
                expirationDate: '08/28',
                cvv: '654',
                balance: Math.floor(Math.random() * 10000),
            },
            {
                cardNumber: 5105105105105100,
                expirationDate: '07/29',
                cvv: '987',
                balance: Math.floor(Math.random() * 10000),
            },
        ];

        let count = 0;
        for (const acc of accounts) {
            const existing = await this.accountModel
                .findOne({ cardNumber: acc.cardNumber })
                .exec();
            if (!existing) {
                const account = new this.accountModel(acc);
                await account.save();
                count++;
            }
        }
        console.log(`Seeded ${count} accounts`);
    }
}
