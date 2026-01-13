import { useEffect, useRef, useState } from 'react';
import { CommentCard } from './CommentCard.tsx';
import { UseFetchCommentsByPostId } from '../../hooks/fetchComments.ts';
import { commentStore } from '../../stores/commentStore.ts';
import Spinner from '../ui/spinner/Spinner.tsx';

interface Props {
    postId: string;
}

export const CommentList = ({ postId }: Props) => {
    const [page, setPage] = useState(1);
    const comments = commentStore((state) => state.comments);
    const pagination = commentStore((state) => state.pagination);
    const resetComments = commentStore((state) => state.resetComments);

    const { isLoading, isFetching } = UseFetchCommentsByPostId(
        postId,
        page,
        10,
    );

    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        resetComments();
        setPage(1);
    }, [postId, resetComments]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    pagination?.hasNext &&
                    !isFetching
                ) {
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 0.1 },
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
            observer.disconnect();
        };
    }, [pagination?.hasNext, isFetching, postId]);

    if (isLoading && page === 1) {
        return <Spinner />;
    }

    return (
        <div className="gap-4 mt-4 flex flex-col">
            {comments.map((comment) => (
                <CommentCard comment={comment} key={comment.id} />
            ))}

            {pagination?.hasNext && (
                <div
                    ref={observerTarget}
                    className="flex justify-center py-4"
                >
                    {isFetching ? (
                        <span className="loading loading-spinner loading-md"></span>
                    ) : (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            Charger plus de commentaires
                        </button>
                    )}
                </div>
            )}

            {comments.length === 0 && !isLoading && (
                <div className="text-center text-base-content/60 py-8">
                    Aucun commentaire pour le moment
                </div>
            )}
        </div>
    );
};
