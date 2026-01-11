import type {
    Comment,
    CreateCommentPayload,
} from '../modules/types/comment.type.ts';
import { UseAuthFetch } from './authFetch.ts';
import { commentStore } from '../stores/commentStore.ts';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const API_URL = import.meta.env.VITE_APIURL;
if (!API_URL) throw new Error('API URL is not configured');

export const UseFetchCommentsByPostId = (postId: string) => {
    const setComments = commentStore((state) => state.setComments);
    const query = useQuery<Comment[], Error>({
        queryKey: ['comments', postId],

        queryFn: async () => {
            return await fetchCommentsByPostId(postId);
        },

        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
    });

    useEffect(() => {
        if (query.data && typeof setComments === 'function') {
            setComments(query.data);
        }
    }, [query.data, setComments]);

    return query;
};

export async function createComment({ data }: CreateCommentPayload) {
    const authFetch = UseAuthFetch();

    const res = await authFetch(`${API_URL}/comment/by-post/${data.postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ text: data.text }),
    });

    if (!res.ok) {
        const error = await res
            .json()
            .catch(() => ({ message: res.statusText }));
        throw new Error(
            error.message || 'Erreur lors de la création du commentaire',
        );
    }
}

async function fetchCommentsByPostId(postId: string): Promise<Comment[]> {
    const authFetch = UseAuthFetch();

    const res = await authFetch(`${API_URL}/comment/by-post/${postId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        const error = await res
            .json()
            .catch(() => ({ message: res.statusText }));
        throw new Error(
            error.message || 'Erreur lors de la récupération des commentaires',
        );
    }

    return res.json();
}
