import type { Comment } from '../../modules/types/comment.type.ts';

interface Props {
    comment: Comment;
}

export const CommentCard = ({ comment }: Props) => {
    return (
        <div className="card p-4 shadow-md shadow-base-300 text-sm gap-2 border border-base-300">
            <div className="flex flex-row gap-4 items-center">
                <div className="card-title text-sm">{comment.author.email}</div>
                <div className="text-sm">
                    {new Date(comment.createdAt ?? '').toLocaleString()}
                </div>
            </div>
            <div>{comment.text}</div>
        </div>
    );
};
