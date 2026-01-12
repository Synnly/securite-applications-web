import { Navbar } from '../components/layout/Navbar.tsx';
import { UseFetchPosts } from '../hooks/fetchPosts.ts';
import { postStore } from '../stores/postStore.ts';
import { PostCard } from '../components/post/PostCard.tsx';
import type { Post } from '../modules/types/post.type.ts';
import Spinner from '../components/ui/spinner/Spinner.tsx';
import { Pagination } from '../components/pagination/Pagination.tsx';

export const AllPostsPage = () => {
    const { isLoading } = UseFetchPosts();
    const data = postStore((state) => state.posts);
    const pagination = postStore((state) => state.pagination);
    const setFilters = postStore((state) => state.setFilters);

    const handlePageChange = (page: number) => {
        setFilters({ page });
    };

    return (
        <>
            <Navbar />
            {isLoading ? (
                <Spinner />
            ) : (
                <div className="flex flex-col w-full px-60 py-10 gap-3">
                    {data &&
                        data.map((post: Post) => (
                            <PostCard key={post.id} post={post} />
                        ))}

                    <Pagination
                        page={pagination?.page || 1}
                        totalPages={pagination?.totalPages || 1}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </>
    );
};
