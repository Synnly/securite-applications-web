import { UseAuthFetch } from './authFetch.ts';
import { useEffect } from 'react';
import { postStore } from '../stores/postStore.ts';
import { useQuery } from '@tanstack/react-query';
import type { CreatePostPayload, Post } from '../modules/types/post.type.ts';

const API_URL = import.meta.env.VITE_APIURL;
if (!API_URL) throw new Error('API URL is not configured');

export const UseFetchPosts = () => {
    const setPosts = postStore((state) => state.setPosts);
    const query = useQuery<Post[], Error>({
        queryKey: ['posts'],

        queryFn: async () => {
            return await fetchPosts();
        },

        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
    });

    useEffect(() => {
        if (query.data && typeof setPosts === 'function') {
            setPosts(query.data);
        }
    }, [query.data, setPosts]);

    return query;
};

async function fetchPosts(): Promise<Post[]> {
    const authFetch = UseAuthFetch();

    const res = await authFetch(`${API_URL}/post/all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        const error = await res
            .json()
            .catch(() => ({ message: res.statusText }));
        throw new Error(
            error.message || 'Erreur lors de la récupération des posts',
        );
    }

    return res.json();
}

export async function createPost({ data }: CreatePostPayload) {
    const authFetch = UseAuthFetch();

    const response = await authFetch(`${API_URL}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(data),
    });

    if (!response.ok) {
        const message =
            (await response.json().catch(() => null))?.message ||
            'Erreur lors de la création du post';
        throw new Error(message);
    }

    // Si la réponse est ok
    if (response.ok) {
        return null;
    }

    return await response.json();
}
