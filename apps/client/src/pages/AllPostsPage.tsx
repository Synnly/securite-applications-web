import { Navbar } from '../components/layout/Navbar.tsx';
import { UseFetchPosts } from '../hooks/fetchPosts.ts';
import { postStore } from '../stores/postStore.ts';
import { PostCard } from '../components/post/PostCard.tsx';
import type { Post } from '../modules/types/post.type.ts';
import Spinner from '../components/ui/spinner/Spinner.tsx';
import { CreatePostModal } from '../components/post/CreatePostModal.tsx';
import { useState } from 'react';

export const AllPostsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isLoading } = UseFetchPosts();
    const data = postStore((state) => state.posts);
    console.log(data);

    return (
        <>
            <Navbar onClickNewPost={() => setIsModalOpen(true)} />
            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    <div className="flex flex-col w-full px-60 py-10 gap-3">
                        {data &&
                            data.map((post: Post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                    </div>
                    <CreatePostModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                </>
            )}
        </>
    );
};
