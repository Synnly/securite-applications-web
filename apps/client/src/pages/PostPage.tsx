import { Navbar } from '../components/layout/Navbar.tsx';
import Spinner from '../components/ui/spinner/Spinner.tsx';
import { UseFetchPostById } from '../hooks/fetchPosts.ts';
import { postStore } from '../stores/postStore.ts';
import { useNavigate, useParams } from 'react-router';
import { useEffect } from 'react';

export const PostPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!postId) {
            navigate('/');
        }
    }, [postId, navigate]);

    if (!postId) return null;

    const { isLoading, isError } = UseFetchPostById(postId);
    const data = postStore((state) => state.getPostById(postId));

    if (isError) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col w-full px-60 py-10 gap-3 text-center font-medium text-6xl">
                    Erreur
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            {isLoading ? (
                <Spinner />
            ) : (
                <div className="flex flex-col w-full px-60 py-10 gap-4">
                    <div className="text-4xl font-medium">{data?.title}</div>
                    <div className="text-base-content/70 italic">
                        Par {data?.author.email} le{' '}
                        {new Date(data?.createdAt ?? '').toLocaleDateString()}
                    </div>
                    <div className="mt-4">{data?.body}</div>
                </div>
            )}
        </>
    );
};
