import { useMutation } from '@tanstack/react-query';
import { userStore } from '../stores/userStore';
import { useLocation, useNavigate } from 'react-router';
import type {FormLogin} from "../modules/types/formLogin.type.ts";

/**
 * Translate error messages from the API to French.
 * @param message - The original error message from the API.
 * @returns Translated error message in French.
 */
function translateMessage(message: string): string {
    if (message === 'Invalid email or password') {
        return 'email ou mot de passe invalide.';
    }
    const regex = /User with email ([\w.-]+@[\w.-]+\.\w+) not found/i;
    if (regex.test(message)) {
        return "Utilisateur avec cet email n'existe pas.";
    }

    return 'Une erreur est survenue, veuillez réessayer plus tard.';
}

export const UseLogin = () => {
    const getAccess = userStore((state) => state.get);
    const setAccess = userStore((state) => state.set);
    const lastLocation = useLocation();
    const navigate = useNavigate();
    const lastLocationRoute = lastLocation.state?.from;
    const API_URL = import.meta.env.VITE_APIURL;
    if (!API_URL) throw new Error('API URL is not configured');

    const { mutateAsync, isPending, isError, error, reset } = useMutation({
        mutationFn: async (data: FormLogin) => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!res.ok) {
                const message = await res.json();
                throw new Error(translateMessage(message.message));
            }
            return res;
        },
    });
    const login = async (data: FormLogin) => {
        const res = await mutateAsync(data);
        if (res.ok) {
            const accessToken = await res.text();
            setAccess(accessToken);
            const user = getAccess(accessToken);
            if (!user) throw new Error('Erreur lors de la récupération des informations utilisateur.');
            const redirectTo = lastLocationRoute || '/';
            navigate(redirectTo);
        }
    };
    return { login, isPending, isError, error, reset };
};
