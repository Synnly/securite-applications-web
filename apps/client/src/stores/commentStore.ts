import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import type { Comment } from '../modules/types/comment.type.ts';

export interface CommentStore {
    comments: Comment[];
    setComments: (comments: Comment[]) => void;
    addComment: (comment: Comment) => void;
    removeComment: (commentId: string) => void;
    getCommentsByPostId: (postId: string) => Comment[];
}

export const commentStore = create<CommentStore>()(
    persist(
        (set, get) => ({
            comments: [],
            setComments: (comments: Comment[]) => set({ comments }),
            addComment: (comment: Comment) =>
                set((state) => ({
                    comments: state.comments.some((c) => c.id === comment.id)
                        ? state.comments
                        : [...state.comments, comment],
                })),
            removeComment: (commentId: string) =>
                set((state) => ({
                    comments: state.comments.filter(
                        (comment) => comment.id !== commentId,
                    ),
                })),
            getCommentsByPostId: (postId: string) =>
                get().comments.filter((comment) => comment.postId === postId),
        }),
        { name: 'comment-storage' },
    ),
);
