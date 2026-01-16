import {useMutation} from '@tanstack/react-query';
import {useNavigate} from 'react-router';
import type {formDonation} from "../modules/types/formDonation.type.ts";
import {UseAuthFetch} from "./authFetch.ts";

export const UseDonation = () => {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_APIURL;
    if (!API_URL) throw new Error('API URL is not configured');
    const BANK_URL = import.meta.env.VITE_BANKURL;
    if (!BANK_URL) throw new Error('Bank URL is not configured');

    const { mutateAsync, isPending, isError, error, reset } = useMutation({
        mutationFn: async (data: {
            amount: string;
            cardNumber: string;
            expirationDate: string;
            cvv: string;
        }) => {
            const authFetch = UseAuthFetch();
            const { amount, ...rest } = data;
            try {
                return await authFetch(`${BANK_URL}/account/pay?amount=${amount}`, {
                    method: 'POST',
                    data: JSON.stringify(rest),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error: any) {
                throw new Error(translateError(error?.message));
            }
        },
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
        console.log(error);
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
