import type { Post } from '../modules/types/post.type.ts';
import { create } from 'zustand';
import type { PaginationResult } from '../modules/types/pagination.type.ts';

export interface PostFilters {
    page: number;
    limit: number;
}

export interface PostStore {
    posts: Post[];
    pagination: Omit<PaginationResult<Post>, 'data'> | null;
    filters: PostFilters;
    setPosts: (data: PaginationResult<Post>) => void;
    setFilters: (filters: Partial<PostFilters>) => void;
    resetFilters: () => void;
    clearPosts: () => void;
    getPostById: (id: string) => Post | null;
    addPost: (post: Post) => void;
}

const DEFAULT_FILTERS: PostFilters = {
    page: 1,
    limit: 10,
};

export const postStore = create<PostStore>()((set, get) => ({
    posts: [],
    pagination: null,
    filters: DEFAULT_FILTERS,

    setPosts: (data) =>
        set({
            posts: data.data,
            pagination: {
                total: data.total,
                page: data.page,
                limit: data.limit,
                totalPages: data.totalPages,
                hasNext: data.hasNext,
                hasPrev: data.hasPrev,
            },
        }),

    setFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        })),

    resetFilters: () => set({ filters: DEFAULT_FILTERS }),

    clearPosts: () =>
        set({
            posts: [],
            pagination: null,
        }),

    getPostById: (id: string) => {
        const post = get().posts.find((post: Post) => post.id === id);
        return post || null;
    },

    addPost: (post: Post) =>
        set((state) => ({
            posts: state.posts.some((p) => p.id === post.id)
                ? state.posts
                : [...state.posts, post],
        })),
}));
