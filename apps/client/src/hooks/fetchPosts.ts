import { UseAuthFetch } from './authFetch.ts';
import { useEffect } from 'react';
import { postStore } from '../stores/postStore.ts';
import { useQuery } from '@tanstack/react-query';
import type { CreatePostPayload, Post } from '../modules/types/post.type.ts';
import type { PaginationResult } from '../modules/types/pagination.type.ts';

const API_URL = import.meta.env.VITE_APIURL;
if (!API_URL) throw new Error('API URL is not configured');

export const UseFetchPosts = () => {
    const setPosts = postStore((state) => state.setPosts);
    const filters = postStore((state) => state.filters);

    const query = useQuery<PaginationResult<Post>, Error>({
        queryKey: ['posts', filters],

        queryFn: async () => {
            return await fetchPosts(filters);
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

async function fetchPosts(filters: {
    page?: number;
    limit?: number;
}): Promise<PaginationResult<Post>> {
    const authFetch = UseAuthFetch();

    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const res = await authFetch(`${API_URL}/post/all?${params.toString()}`, {
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

export const UseFetchPostById = (id: string) => {
    const authFetch = UseAuthFetch();
    const cachedPost = postStore((state) =>
        state.posts.find((p) => p.id === id),
    );
    const addPost = postStore((state) => state.addPost);

    const query = useQuery<Post, Error>({
        queryKey: ['post', id],
        queryFn: async () => {
            return await fetchPostById(id, authFetch);
        },
        initialData: cachedPost,
        staleTime: cachedPost ? 5 * 60 * 1000 : 0,
        retry: (failureCount, error) => {
            if (error.message.includes('404')) return false;
            return failureCount < 3;
        },
    });

    useEffect(() => {
        if (query.data && !cachedPost && query.isSuccess) {
            addPost(query.data);
        }
    }, [query.data, query.isSuccess, cachedPost, addPost]);

    return query;
};

export async function fetchPostById(
    id: string,
    injectedAuthFetch?: any,
): Promise<Post> {
    const authFetch = injectedAuthFetch || UseAuthFetch();
    const res = await authFetch(`${API_URL}/post/by-id/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (res.status === 404) {
        throw new Error('404 Not Found');
    }

    if (!res.ok) {
        throw new Error('Erreur lors de la récupération du post');
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
}

export async function deletePost(postId: string): Promise<void> {
    const authFetch = UseAuthFetch();

    const res = await authFetch(`${API_URL}/post/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        const error = await res
            .json()
            .catch(() => ({ message: res.statusText }));
        throw new Error(
            error.message || 'Erreur lors de la suppression du post',
        );
    }
}
