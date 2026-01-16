import { Test, TestingModule } from '@nestjs/testing';
import { DonationController } from '../../../src/donation/donation.controller';
import { DonationService } from '../../../src/donation/donation.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DonationController', () => {
    let controller: DonationController;
    let donationService: DonationService;

    beforeEach(async () => {
        const mockDonationService = {
            verifyDonation: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [DonationController],
            providers: [
                {
                    provide: DonationService,
                    useValue: mockDonationService,
                },
            ],
        }).compile();

        controller = module.get<DonationController>(DonationController);
        donationService = module.get<DonationService>(DonationService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('verify', () => {
        const paymentId = 'payment123';

        it('should verify a donation successfully', async () => {
            jest.spyOn(donationService, 'verifyDonation').mockResolvedValue(
                undefined,
            );

            await controller.verify(paymentId);

            expect(donationService.verifyDonation).toHaveBeenCalledWith(
                paymentId,
            );
        });

        it('should propagate NotFoundException from service', async () => {
            const error = new NotFoundException('Payment not found');
            jest.spyOn(donationService, 'verifyDonation').mockRejectedValue(
                error,
            );

            await expect(controller.verify(paymentId)).rejects.toThrow(
                NotFoundException,
            );
            expect(donationService.verifyDonation).toHaveBeenCalledWith(
                paymentId,
            );
        });

        it('should propagate BadRequestException from service', async () => {
            const error = new BadRequestException('Payment already claimed');
            jest.spyOn(donationService, 'verifyDonation').mockRejectedValue(
                error,
            );

            await expect(controller.verify(paymentId)).rejects.toThrow(
                BadRequestException,
            );
            expect(donationService.verifyDonation).toHaveBeenCalledWith(
                paymentId,
            );
        });
    });
});
