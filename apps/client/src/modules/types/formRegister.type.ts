import { z } from 'zod';

export const passwordSchema = z
    .string()
    .min(8, { message: 'le mot de passe doit contenir au moins 8 caractères' })
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/, {
        message:
            'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (!@#$%^&*)',
    });

export const formSignUpSchema = z
    .object({
        email: z.email({ message: 'Email invalide' }),
        password: passwordSchema,
        repeatPassword: z.string(),
    })
    .refine(
        (data) =>
            !data.password ||
            !data.repeatPassword ||
            data.password === data.repeatPassword,
        {
            message: 'Les mots de passe ne correspondent pas',
            path: ['repeatPassword'],
        },
    );

export type registerForm = {
    url: string;
    data: Omit<formSignUp, 'repeatPassword'> & { role: 'USER' };
};

export type formSignUp = z.infer<typeof formSignUpSchema>;
