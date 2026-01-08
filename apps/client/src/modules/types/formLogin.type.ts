import z from 'zod';

export type FormLogin = {
    email: string;
    password: string;
}

export const FormLoginSchema = z.object({
    email: z.string().min(1, { message: "L'email est requis" }).email({ message: 'Email invalide' }),
    password: z.string().min(1, { message: 'Le mot de passe est requis' }),
});