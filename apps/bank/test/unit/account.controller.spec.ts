import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from '../../src/account/account.controller';
import { AccountService } from '../../src/account/account.service';
import { AccountDto } from '../../src/account/dto/account.dto';
import { BadRequestException } from '@nestjs/common';

describe('AccountController', () => {
    let controller: AccountController;
    let mockAccountService: any;

    const mockPaymentId = 'payment_id_123';
    const mockPayment = {
        _id: mockPaymentId,
        amount: 50,
        account: 'account_id_123',
    };

    beforeEach(async () => {
        mockAccountService = {
            pay: jest.fn(),
            verifyPayment: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AccountController],
            providers: [
                {
                    provide: AccountService,
                    useValue: mockAccountService,
                },
            ],
        }).compile();

        controller = module.get<AccountController>(AccountController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('pay', () => {
        it('should process a payment successfully and return payment ID', async () => {
            const dto: AccountDto = {
                cardNumber: 1234567812345678,
                expirationDate: '12/25',
                cvv: 123,
            };
            const amount = 50.0;

            mockAccountService.pay.mockResolvedValue(mockPayment);

            const result = await controller.pay(dto, amount);

            expect(result).toBe(mockPaymentId);
            expect(mockAccountService.pay).toHaveBeenCalledWith(dto, amount);
        });

        it('should propagate errors from service', async () => {
            const dto: AccountDto = {
                cardNumber: 1234567812345678,
                expirationDate: '12/25',
                cvv: 123,
            };
            mockAccountService.pay.mockRejectedValue(
                new BadRequestException('Error'),
            );

            await expect(controller.pay(dto, 10)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('verify', () => {
        it('should verify a payment', async () => {
            mockAccountService.verifyPayment.mockResolvedValue(undefined);

            await controller.verify(mockPaymentId);

            expect(mockAccountService.verifyPayment).toHaveBeenCalledWith(
                mockPaymentId,
            );
        });
    });
});
