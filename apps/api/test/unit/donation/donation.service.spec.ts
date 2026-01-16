import { Test, TestingModule } from '@nestjs/testing';
import { DonationService } from '../../../src/donation/donation.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';

describe('DonationService', () => {
    let service: DonationService;
    let httpService: HttpService;

    const mockHttpService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DonationService,
                {
                    provide: HttpService,
                    useValue: mockHttpService,
                },
            ],
        }).compile();

        service = module.get<DonationService>(DonationService);
        httpService = module.get<HttpService>(HttpService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('verifyDonation', () => {
        const paymentId = '12345';

        it('should verify donation successfully when bank returns 200', async () => {
            const response: AxiosResponse = {
                data: {},
                status: 200,
                statusText: 'OK',
                headers: {},
                config: { headers: {} as any },
            };

            mockHttpService.get.mockReturnValue(of(response));

            await service.verifyDonation(paymentId);

            expect(httpService.get).toHaveBeenCalledWith(
                expect.stringContaining(`/account/verify/${paymentId}`),
            );
        });

        it('should throw NotFoundException when bank returns 404', async () => {
            const error: Partial<AxiosError> = {
                status: 404,
                message: 'Payment not found',
            };
            mockHttpService.get.mockReturnValue(throwError(() => error));

            await expect(service.verifyDonation(paymentId)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw BadRequestException when bank returns 400', async () => {
            const error: Partial<AxiosError> = {
                status: 400,
                message: 'Payment already claimed',
            };
            mockHttpService.get.mockReturnValue(throwError(() => error));

            await expect(service.verifyDonation(paymentId)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException for other errors and log them', async () => {
            const loggerSpy = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation();
            const error = {
                status: 500,
                message: 'Internal Server error',
            };
            mockHttpService.get.mockReturnValue(throwError(() => error));

            await expect(service.verifyDonation(paymentId)).rejects.toThrow(
                BadRequestException,
            );
            expect(loggerSpy).toHaveBeenCalled();
        });
    });
});
