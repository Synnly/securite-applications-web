import { IsInt, Length, Matches } from 'class-validator';

export class AccountDto {
    @IsInt()
    @Length(16, 16)
    cardNumber: number;

    @Matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])$/)
    expirationDate: string;

    @IsInt()
    @Length(3, 3)
    cvv: number;
}
