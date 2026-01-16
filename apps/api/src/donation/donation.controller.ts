import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { DonationService } from './donation.service';

@Controller('donation')
export class DonationController {
    constructor(private readonly donationService: DonationService) {}

    /**
     * Verifies a donation payment with the given ID.
     * @param id The donation payment identifier.
     * @throws NotFoundException if no donation exists with the given ID.
     * @throws BadRequestException if the donation has already been claimed or other verification errors occur.
     */
    @Post('verify/:id')
    @HttpCode(HttpStatus.OK)
    async verify(@Param('id') id: string): Promise<void> {
        return this.donationService.verifyDonation(id);
    }
}
