import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class DonationService {
    private logger: Logger;
    private BANK_URL = process.env.BANK_URL;

    constructor(private readonly httpService: HttpService) {
        this.logger = new Logger('DonationService');
    }

    /**
     * Verifies a donation payment with the banking service.
     * @param paymentId The identifier of the payment to verify.
     * @throws NotFoundException if the payment is not found.
     * @throws BadRequestException for other errors during verification.
     */
    async verifyDonation(paymentId: string): Promise<void> {
        await firstValueFrom(
            this.httpService
                .get(`${this.BANK_URL}/account/verify/${paymentId}`)
                .pipe(
                    catchError((error: AxiosError) => {
                        if (error.status == 404) {
                            throw new NotFoundException(error.message);
                        }
                        if (error.status == 400) {
                            throw new BadRequestException(error.message);
                        }
                        this.logger.error(
                            `Error verifying donation payment: ${error.message}`,
                        );
                        throw new BadRequestException(
                            'Error verifying donation payment',
                        );
                    }),
                ),
        );
    }
}
