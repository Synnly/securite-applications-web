import { useMutation } from '@tanstack/react-query';
import { userStore } from '../stores/userStore';
import { useNavigate } from 'react-router';
import type { formSignUp } from '../modules/types/formRegister.type';

export const UseRegister = () => {
    const setAccess = userStore((state) => state.set);
    const getAccess = userStore((state) => state.get);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_APIURL;
    if (!API_URL) throw new Error('API URL is not configured');

    const performRegisterRequest = async (data: formSignUp): Promise<Response> => {
        const dataToSend = { email: data.email, password: data.password, role: 'USER' };
        let res = await fetch(`${API_URL}/user`, {
            method: 'POST',
            body: JSON.stringify(dataToSend),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!res.ok) {
            if (res.status === 419) {
                const csrfRes = await fetch(`${API_URL}/csrf-token`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!csrfRes.ok) {
                    throw new Error('Erreur lors de la récupération du token CSRF');
                }

                res = await fetch(`${API_URL}/user`, {
                    method: 'POST',
                    body: JSON.stringify(dataToSend),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                if (res.ok) {
                    return res;
                }
            }
            const message = await res.json();
            throw new Error(message.message);
        }

        return res;
    }

    const { mutateAsync, isPending, isError, error, reset } = useMutation({
        mutationFn: performRegisterRequest,
    });

    const register = async (data: formSignUp) => {
        const { repeatPassword, ...registerData } = data;
        const res = await mutateAsync(data);

        if (res.ok) {
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({
                    email: registerData.email,
                    password: registerData.password,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (loginRes.ok) {
                const accessToken = await loginRes.text();
                setAccess(accessToken);
                const user = getAccess(accessToken);
                if (!user)
                    throw new Error(
                        'Erreur lors de la récupération des informations utilisateur.',
                    );
                navigate('/posts');
            }
        }
    };

    return { register, isPending, isError, error, reset };
};
