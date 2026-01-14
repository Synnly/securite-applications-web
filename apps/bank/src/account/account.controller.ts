import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    ValidationPipe,
} from '@nestjs/common';
import { AccountDto } from './dto/account.dto';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    /**
     * Processes a payment from the account associated with the provided credentials.
     * @param dto The account details including card number, expiration date, and CVV.
     * @param amount The amount to be paid from the account.
     * @returns The identifier of the processed payment.
     */
    @Post('pay')
    @HttpCode(HttpStatus.OK)
    async pay(
        @Body(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        dto: AccountDto,
        @Param('amount') amount: number,
    ): Promise<string> {
        const payment = await this.accountService.pay(dto, amount);
        return payment._id.toString();
    }

    /**
     * Verifies the payment associated with the provided ID.
     * @param id The account identifier.
     * @throws{NotFoundException} if no payment exists with the given ID.
     * @throws{BadRequestException} if the payment has already been claimed.
     */
    @Get('verify')
    @HttpCode(HttpStatus.OK)
    async verify(@Param('id') id: string): Promise<void> {
        return this.accountService.verifyPayment(id);
    }
}
