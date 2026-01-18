import { UseAuthFetch } from './authFetch';
import { useQuery } from '@tanstack/react-query';
import type { SimplyUser } from '../modules/types/user.type';

const API_URL = import.meta.env.VITE_APIURL;
if (!API_URL) throw new Error('API URL is not configured');

export const useFetchUsers = () => {
    const query = useQuery<SimplyUser[], Error>({
        queryKey: ['users'],
        queryFn: async () => {
            return await fetchUsers();
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
    });

    return query;
};

async function fetchUsers(): Promise<SimplyUser[]> {
    const authFetch = UseAuthFetch();

    const res = await authFetch(`${API_URL}/user`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        const error = await res
            .json()
            .catch(() => ({ message: res.statusText }));
        throw new Error(
            error.message || 'Erreur lors de la récupération des utilisateurs',
        );
    }

    return res.json();
}

export async function banUser(userId: string): Promise<void> {
    const authFetch = UseAuthFetch();

    const res = await authFetch(`${API_URL}/user/${userId}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        const error = await res
            .json()
            .catch(() => ({ message: res.statusText }));
        throw new Error(
            error.message || "Erreur lors du bannissement de l'utilisateur",
        );
    }
}

export async function unbanUser(userId: string): Promise<void> {
    const authFetch = UseAuthFetch();

    const res = await authFetch(`${API_URL}/user/${userId}/unban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        const error = await res
            .json()
            .catch(() => ({ message: res.statusText }));
        throw new Error(
            error.message || "Erreur lors du dé-bannissement de l'utilisateur",
        );
    }
}

export { useFetchUsers as UseFetchUsers, banUser as BanUser, unbanUser as UnbanUser };
