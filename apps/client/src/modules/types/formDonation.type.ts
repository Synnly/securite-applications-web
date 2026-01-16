import { z } from 'zod';

export const formDonationSchema = z
    .object({
        amount: z
            .string()
            .regex(/^\d+(.\d+)?$/, { message: 'Le montant doit être un nombre' }),
        cardNumber: z
            .string()
            .regex(/^[0-9]{16}$/, { message: 'Le numéro de carte doit être composé de 16 chiffres' }),
        expirationDate: z
            .string()
            .regex(/^(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])$/, { message: "La date d'expiration doit être au format MM/AA" }),
        cvv: z
            .string()
            .regex(/^[0-9]{3}$/, { message: 'Le CVV doit être composé de 3 chiffres' }),
    });

export type formDonation = z.infer<typeof formDonationSchema>;
