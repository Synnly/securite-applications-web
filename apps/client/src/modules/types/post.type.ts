import { z } from 'zod';

export type Post = {
    _id: string;
    title: string;
    body: string;
    author: string;
    createdAt: string;
};

export const createPostSchema = z.object({
    title: z.string().min(1, { message: 'Le titre est requis' }),
    body: z.string().min(1, { message: 'Le corps est requis' }),
});

export type CreatePostForm = z.infer<typeof createPostSchema>;

export type CreatePostPayload = {
    data: {
        title: string;
        body: string;
    };
};
