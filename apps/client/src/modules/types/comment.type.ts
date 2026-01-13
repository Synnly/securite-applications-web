import { z } from 'zod';
import type { User } from './user.type.ts';

export type Comment = {
    id: string;
    text: string;
    author: User;
    postId: string;
    createdAt: Date;
};

export const createCommentSchema = z.object({
    text: z.string().min(1, { message: 'Le commentaire est requis' }),
});

export type CreateCommentForm = z.infer<typeof createCommentSchema>;

export type CreateCommentPayload = {
    data: {
        text: string;
        postId: string;
    };
};
