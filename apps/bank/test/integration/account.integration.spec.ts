import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AccountModule } from '../../src/account/account.module';
import { AccountDto } from '../../src/account/dto/account.dto';
import { Model } from 'mongoose';
import { Account, AccountDocument } from '../../src/account/account.schema';
import { Payment, PaymentDocument } from '../../src/account/payment.schema';
import * as bcrypt from 'bcrypt';

describe('AccountModule (Integration)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let accountModel: Model<AccountDocument>;
    let paymentModel: Model<PaymentDocument>;

    const validAccountDto: AccountDto = {
        cardNumber: '1234567812345678',
        expirationDate: '12/25',
        cvv: '123',
    };

    const initialBalance = 1000;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [MongooseModule.forRoot(uri), AccountModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        accountModel = moduleFixture.get<Model<AccountDocument>>(
            getModelToken(Account.name),
        );
        paymentModel = moduleFixture.get<Model<PaymentDocument>>(
            getModelToken(Payment.name),
        );

        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await mongod.stop();
    });

    beforeEach(async () => {
        await accountModel.deleteMany({});
        await paymentModel.deleteMany({});

        // Create a valid account for testing
        // Note: The pre-save hook handles hashing
        const account = new accountModel({
            ...validAccountDto,
            balance: initialBalance,
        });
        await account.save();
    });

    describe('POST /account/pay', () => {
        it('should process a payment successfully', async () => {
            const amount = 100;
            const response = await request(app.getHttpServer())
                .post('/account/pay')
                .query({ amount: amount })
                .send(validAccountDto)
                .expect(200);

            // Response should be the payment ID
            expect(response.text).toBeDefined();

            // Check database state
            const updatedAccount = await accountModel.findOne({
                cardNumber: validAccountDto.cardNumber,
            });
            expect(updatedAccount.balance).toBe(initialBalance - amount);

            const payment = await paymentModel.findById(response.text);
            expect(payment).toBeDefined();
            expect(payment.amount).toBe(amount);
            expect(payment.claimDate).toBeUndefined(); // Not yet verified
        });

        it('should fail if account not found (wrong card number)', async () => {
            const invalidDto = {
                ...validAccountDto,
                cardNumber: '8765432187654321',
            }; // Non-existent
            await request(app.getHttpServer())
                .post('/account/pay')
                .query({ amount: 100 })
                .send(invalidDto)
                .expect(404);
        });

        it('should fail if credentials do not match (wrong CVV)', async () => {
            const invalidDto = { ...validAccountDto, cvv: '999' };
            await request(app.getHttpServer())
                .post('/account/pay')
                .query({ amount: 100 })
                .send(invalidDto)
                .expect(404);
        });

        it('should fail if insufficient balance', async () => {
            const amount = initialBalance + 500;
            await request(app.getHttpServer())
                .post('/account/pay')
                .query({ amount })
                .send(validAccountDto)
                .expect(400);
        });

        it('should fail validation with invalid input format', async () => {
            const invalidDto = {
                cardNumber: 123, // Too short
                expirationDate: 'invalid',
                cvv: 12, // Too short
            };

            await request(app.getHttpServer())
                .post('/account/pay')
                .query({ amount: 100 })
                .send(invalidDto)
                .expect(400);
        });
    });

    describe('GET /account/verify', () => {
        let paymentId: string;

        beforeEach(async () => {
            const account = await accountModel.findOne({
                cardNumber: validAccountDto.cardNumber,
            });
            const payment = new paymentModel({
                account: account._id,
                amount: 50,
            });
            await payment.save();
            paymentId = payment._id.toString();
        });

        it('should verify a valid unclaimed payment', async () => {
            await request(app.getHttpServer())
                .get(`/account/verify/${paymentId}`)
                .expect(200);

            const updatedPayment = await paymentModel.findById(paymentId);
            expect(updatedPayment.claimDate).toBeDefined();
        });

        it('should fail if payment does not exist', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            await request(app.getHttpServer())
                .get('/account/verify')
                .query({ id: fakeId })
                .expect(404);
        });

        it('should fail if payment is already claimed', async () => {
            // First claim
            await request(app.getHttpServer())
                .get(`/account/verify/${paymentId}`)
                .expect(200);

            // Second claim attempt
            await request(app.getHttpServer())
                .get(`/account/verify/${paymentId}`)
                .expect(400);
        });
    });
});
