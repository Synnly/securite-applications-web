import type { Post } from '../modules/types/post.type.ts';
import { persist } from 'zustand/middleware';
import { create } from 'zustand';

export interface PostStore {
    posts: Post[];
    setPosts: (posts: Post[]) => void;
    addPost: (post: Post) => void;
    removePost: (postId: string) => void;
    getPostById: (id: string) => Post | null;
}

export const postStore = create<PostStore>()(
    persist(
        (set, get) => ({
            posts: [],
            setPosts: (posts: Post[]) => set({ posts }),
            addPost: (post: Post) =>
                set((state) => ({
                    posts: state.posts.some((p) => p.id === post.id)
                        ? state.posts
                        : [...state.posts, post],
                })),
            removePost: (postId: string) =>
                set((state) => ({
                    posts: state.posts.filter((post) => post.id !== postId),
                })),
            getPostById: (id: string) => {
                const post = get().posts.find((post: Post) => post.id === id);
                return post || null;
            },
        }),
        { name: 'post-storage' },
    ),
);
