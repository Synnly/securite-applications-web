import {useMutation} from '@tanstack/react-query';
import {useNavigate} from 'react-router';
import type {formDonation} from "../modules/types/formDonation.type.ts";

export const UseDonation = () => {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_APIURL;
    if (!API_URL) throw new Error('API URL is not configured');
    const BANK_URL = import.meta.env.VITE_BANKURL;
    if (!BANK_URL) throw new Error('Bank URL is not configured');

    const performDonationRequest = async (data: formDonation): Promise<Response> => {
        const { amount, ...rest } = data;

        let res = await fetch(`${BANK_URL}/account/pay?amount=${amount}`, {
            method: 'POST',
            body: JSON.stringify(rest),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include"
        });

        if (!res.ok) {
            if (res.status === 419) {
                const csrfRes = await fetch(`${BANK_URL}/csrf-token`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!csrfRes.ok) {
                    throw new Error('Erreur lors de la récupération du token CSRF');
                }

                res = await fetch(`${BANK_URL}/account/pay?amount=${amount}`, {
                    method: 'POST',
                    body: JSON.stringify(rest),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: "include"
                });
                if (res.ok) {
                    return res;
                }
            }
            const message = await res.json();
            throw new Error(translateError(message.message));
        }
        return res;
    };

    const { mutateAsync, isPending, isError, error, reset } = useMutation({
        mutationFn: performDonationRequest,
    });

    const register = async (data: formDonation) => {
        const res = await mutateAsync(data);
        let _id;
        let paidAmount;
        const json = (await res.json());
        if (res.ok) {
            _id = json._id;
            paidAmount = json.amount;
            navigate(`/donate/success?_id=${_id}&amount=${paidAmount}`);
        }
    };

    const translateError = (error?: string) => {
        if(!error) return;
        switch (error) {
            case 'Insufficient balance':
                return "Erreur : Fonds insuffisants";
            case 'Account not found':
                return "Erreur : Compte non trouvé";
            default:
                return "Une erreur est survenue. Veuillez réessayer.";
        }
    }

    return { register, isPending, isError, error, reset };
};
