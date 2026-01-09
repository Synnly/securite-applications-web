import type {Post} from "../modules/types/post.type.ts";
import {persist} from "zustand/middleware";
import {create} from "zustand";


export interface PostStore {
    posts: Post[];
    setPosts: (posts: Post[]) => void;
    addPost: (post: Post) => void;
    removePost: (postId: string) => void;
}

export const postStore = create<PostStore>()(
    persist(
        (set) => ({
            posts: [],
            setPosts: (posts: Post[]) => set({ posts }),
            addPost: (post: Post) => set((state) => ({ posts: [...state.posts, post] })),
            removePost: (postId: string) =>
                set((state) => ({
                    posts: state.posts.filter((post) => post._id !== postId),
                })),
        }),
        { name: 'post-storage' },
    )
)