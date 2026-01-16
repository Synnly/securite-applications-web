import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from '../../src/account/account.service';
import { getModelToken } from '@nestjs/mongoose';
import { Account } from '../../src/account/account.schema';
import { Payment } from '../../src/account/payment.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';

// Mock global du module bcrypt pour autoriser la redéfinition des méthodes
jest.mock('bcrypt');

describe('AccountService', () => {
    let service: AccountService;
    let accountModel: any;
    let paymentModel: any;

    const mockAccountDto = {
        cardNumber: '1234567812345678',
        expirationDate: '12/25',
        cvv: '123',
    };

    const mockAccountDoc = {
        _id: new Types.ObjectId(),
        ...mockAccountDto,
        expirationDate: 'hashed_exp',
        cvv: 'hashed_cvv',
        balance: 1000,
        save: jest.fn(),
    };

    const mockPaymentDoc = {
        _id: new Types.ObjectId(),
        account: mockAccountDoc,
        amount: 100,
        claimDate: null,
        save: jest.fn(),
    };

    beforeEach(async () => {
        const mockAccountModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue(dto),
        }));
        (mockAccountModel as any).findOne = jest.fn();

        const mockPaymentModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue(dto),
        }));
        (mockPaymentModel as any).findById = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AccountService,
                {
                    provide: getModelToken(Account.name),
                    useValue: mockAccountModel,
                },
                {
                    provide: getModelToken(Payment.name),
                    useValue: mockPaymentModel,
                },
            ],
        }).compile();

        service = module.get<AccountService>(AccountService);
        accountModel = module.get(getModelToken(Account.name));
        paymentModel = module.get(getModelToken(Payment.name));

        // Initialisation des mocks bcrypt
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_value');
        (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createAccount', () => {
        it('should create an account successfully', async () => {
            await service.createAccount(mockAccountDto, 100);
            expect(accountModel).toHaveBeenCalledWith({
                ...mockAccountDto,
                cardNumber: Number.parseInt(mockAccountDoc.cardNumber),
                balance: 100,
            });
        });

        it('should throw BadRequest if balance is negative', async () => {
            await expect(
                service.createAccount(mockAccountDto, -10),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('pay', () => {
        it('should process payment successfully', async () => {
            accountModel.findOne.mockResolvedValue(mockAccountDoc);

            const result = await service.pay(mockAccountDto, 100);

            expect(result).toBeDefined();
            expect(accountModel.findOne).toHaveBeenCalledWith({
                cardNumber: Number.parseInt(mockAccountDto.cardNumber),
            });
            expect(bcrypt.compare).toHaveBeenCalledTimes(2);
            expect(mockAccountDoc.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException if account not found', async () => {
            accountModel.findOne.mockResolvedValue(null);
            await expect(service.pay(mockAccountDto, 100)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw BadRequestException if insufficient balance', async () => {
            const poorAccount = {
                ...mockAccountDoc,
                balance: 10,
                save: jest.fn(),
            };
            accountModel.findOne.mockResolvedValue(poorAccount);
            await expect(service.pay(mockAccountDto, 100)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw NotFoundException if credentials do not match', async () => {
            accountModel.findOne.mockResolvedValue(mockAccountDoc);

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.pay(mockAccountDto, 100)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('verifyPayment', () => {
        const paymentId = 'pay123';

        it('should verify an unclaimed payment', async () => {
            const payment = { ...mockPaymentDoc, save: jest.fn() };
            paymentModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(payment),
            });

            await service.verifyPayment(paymentId);

            expect(payment.claimDate).toBeDefined();
            expect(payment.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException if payment not found', async () => {
            paymentModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            await expect(service.verifyPayment(paymentId)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw BadRequestException if already claimed', async () => {
            const claimedPayment = { ...mockPaymentDoc, claimDate: new Date() };
            paymentModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(claimedPayment),
            });

            await expect(service.verifyPayment(paymentId)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('seedAccounts', () => {
        it('should seed accounts if not present', async () => {
            accountModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            const saveSpy = jest.fn();
            // Override constructor mock for this test to capture save spy
            accountModel.mockImplementation((dto) => ({
                ...dto,
                save: saveSpy,
            }));

            await service.seedAccounts();

            expect(saveSpy).toHaveBeenCalled();
        });

        it('should skip seeding if account exists', async () => {
            accountModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockAccountDoc),
            });
            const saveSpy = jest.fn();
            accountModel.mockImplementation((dto) => ({
                ...dto,
                save: saveSpy,
            }));

            await service.seedAccounts();

            expect(saveSpy).not.toHaveBeenCalled();
        });
    });
});
