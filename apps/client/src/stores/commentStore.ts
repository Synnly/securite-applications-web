import { create } from 'zustand';
import type { Comment } from '../modules/types/comment.type.ts';
import type { PaginationResult } from '../modules/types/pagination.type.ts';

export interface CommentFilters {
    page: number;
    limit: number;
    postId: string;
}

export interface CommentStore {
    comments: Comment[];
    pagination: Omit<PaginationResult<Comment>, 'data'> | null;
    filters: CommentFilters | null;
    setComments: (data: PaginationResult<Comment>, postId: string) => void;
    loadMore: (data: PaginationResult<Comment>) => void;
    addComment: (comment: Comment) => void;
    removeComment: (commentId: string) => void;
    setFilters: (filters: CommentFilters) => void;
    resetComments: () => void;
}

export const commentStore = create<CommentStore>()((set, _) => ({
    comments: [],
    pagination: null,
    filters: null,

    setComments: (data, postId) => {
        set({
            comments: data.data,
            pagination: {
                total: data.total,
                page: data.page,
                limit: data.limit,
                totalPages: data.totalPages,
                hasNext: data.hasNext,
                hasPrev: data.hasPrev,
            },
            filters: {
                page: data.page,
                limit: data.limit,
                postId,
            },
        });
    },

    loadMore: (data) => {
        set((state) => ({
            comments: [...state.comments, ...data.data],
            pagination: {
                total: data.total,
                page: data.page,
                limit: data.limit,
                totalPages: data.totalPages,
                hasNext: data.hasNext,
                hasPrev: data.hasPrev,
            },
            filters: state.filters
                ? { ...state.filters, page: data.page }
                : null,
        }));
    },

    addComment: (comment: Comment) =>
        set((state) => ({
            comments: state.comments.some((c) => c.id === comment.id)
                ? state.comments
                : [comment, ...state.comments],
        })),

    removeComment: (commentId: string) =>
        set((state) => ({
            comments: state.comments.filter(
                (comment) => comment.id !== commentId,
            ),
        })),

    setFilters: (filters) => set({ filters }),

    resetComments: () =>
        set({
            comments: [],
            pagination: null,
            filters: null,
        }),
}));
