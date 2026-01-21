import { Matches } from 'class-validator';

export class AccountDto {
    @Matches(/^[0-9]{16}$/)
    cardNumber: string;

    @Matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])$/)
    expirationDate: string;

    @Matches(/^[0-9]{3}$/)
    cvv: string;
}
