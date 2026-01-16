import { Navbar } from '../components/layout/Navbar.tsx';
import Spinner from '../components/ui/spinner/Spinner.tsx';
import { UseFetchPostById } from '../hooks/fetchPosts.ts';
import { useNavigate, useParams } from 'react-router';
import { useEffect } from 'react';
import { CommentInput } from '../components/comment/CommentInput.tsx';
import { CommentList } from '../components/comment/CommentList.tsx';
import MDEditor from '@uiw/react-md-editor';

export const PostPage = () => {
    const { postId } = useParams();
    const safePostId = postId ?? '';
    const navigate = useNavigate();

    const { isLoading, isError, data: post } = UseFetchPostById(safePostId);

    useEffect(() => {
        if (!safePostId) {
            navigate('/');
        }
    }, [safePostId, navigate]);

    if (!postId) return null;

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
                <>
                    <div className="flex flex-col w-full p-4 lg:px-60 lg:py-10 gap-4">
                        <div className="card shadow-lg shadow-base-300 border border-base-300">
                            <div className="card-body">
                                <div className="text-2xl lg:text-4xl font-medium">
                                    {post?.title}
                                </div>
                                <div className="text-base-content/70 italic">
                                    Par {post?.author.email} le{' '}
                                    {new Date(
                                        post?.createdAt ?? '',
                                    ).toLocaleDateString()}
                                </div>
                                <div className="prose prose-lg max-w-none [&_.wmde-markdown]:bg-transparent! [&_.wmde-markdown]:p-0!
                                [&_.wmde-markdown-var]:bg-transparent! **:bg-transparent!">
                                    <MDEditor.Markdown source={post?.body ?? ''} />
                                </div>
                            </div>
                        </div>
                        <div className="w-full">
                            <CommentInput postId={postId} />
                            <CommentList postId={postId} />
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
