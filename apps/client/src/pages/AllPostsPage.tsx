import { Navbar } from '../components/layout/Navbar.tsx';
import { UseFetchPosts } from '../hooks/fetchPosts.ts';
import { postStore } from '../stores/postStore.ts';
import { PostCard } from '../components/post/PostCard.tsx';
import type { Post } from '../modules/types/post.type.ts';
import Spinner from '../components/ui/spinner/Spinner.tsx';
import { Pagination } from '../components/pagination/Pagination.tsx';
import { useLoaderData } from 'react-router';

export async function AllPostsLoader() {
    const data = postStore((state) => state.posts);
    const pagination = postStore((state) => state.pagination);
    const setFilters = postStore((state) => state.setFilters);
    return { data, pagination, setFilters };
}

export const AllPostsPage = () => {
    const { isLoading } = UseFetchPosts();
    const { data, pagination, setFilters } = useLoaderData();

    const handlePageChange = (page: number) => {
        setFilters({ page });
    };

    return (
        <>
            <Navbar />
            {isLoading ? (
                <Spinner />
            ) : (
                <div className="flex flex-col w-full p-3 lg:px-60 lg:py-10 gap-3">
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
