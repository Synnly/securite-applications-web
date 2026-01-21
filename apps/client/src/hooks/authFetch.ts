import {redirect} from 'react-router-dom';
import {userStore} from '../stores/userStore';

interface FetchOptions<TData = unknown> {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: TData;
    headers?: Record<string, string>;
}

export const UseAuthFetch = () => {
    const accessToken = userStore.getState().access;
    const setUserToken = userStore.getState().set;

    return async <TData extends BodyInit | null | undefined>(
        url: string,
        options?: FetchOptions<TData>,
    ): Promise<Response> => {
        const doFetch = async (): Promise<Response> => {
            try {
                const res = await fetch(url, {
                    method: options?.method || 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(options?.headers || {}),
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                    body: options?.data,
                    credentials: 'include',
                });

                if (!res.ok) {
                    if (res.status === 401) throw new Error('UNAUTHORIZED');
                    if (res.status === 403) {
                        if (JSON.parse(await res.text()).message === "User is banned") {
                            throw new Error('Votre compte est banni.');
                        }
                        throw new Error('Vous n\'avez pas la permission d\'effectuer cette action.');
                    }
                    throw new Error(JSON.parse(await res.text()).message || 'Erreur lors de la requête');
                }

                return res;
            } catch (err) {
                if (err instanceof TypeError && err.message === 'Failed to fetch') {
                    throw new Error('Impossible de contacter le serveur (CORS ou réseau)');
                }
                throw err;
            }
        };

        try {
            return await doFetch();
        } catch (err) {
            const apiUrl = import.meta.env.VITE_APIURL;
            if (!apiUrl) throw new Error('API URL is not configured');

            // Handle CSRF token refresh
            if (err instanceof Error && err.message === 'Invalid CSRF Token. Please get a new one at /csrf-token and try again.') {
                const baseUrl = new URL(url).origin;
                console.log(baseUrl)

                const csrfRes = await fetch(`${baseUrl}/csrf-token`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!csrfRes.ok) {
                    throw new Error('Erreur lors de la récupération du token CSRF');
                }

                return await doFetch();
            }

            // Handle access token refresh
            else if (err instanceof Error && err.message === 'UNAUTHORIZED') {
                try {
                    const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
                        method: 'POST',
                        credentials: 'include',
                    });

                    if (!refreshRes.ok) {
                        return redirect('/signin');
                    }

                    // refresh renvoie le token en texte
                    const newAccessToken = await refreshRes.text();
                    setUserToken(newAccessToken);

                    // Retente la requête initiale avec le nouveau token
                    return await doFetch();
                } catch (refreshErr) {
                    return redirect('/signin');
                }
            }
            else {
                throw err;
            }
        }
    };
};
