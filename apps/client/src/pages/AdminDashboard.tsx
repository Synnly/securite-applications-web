import { FileText, Users } from 'lucide-react';
import Tabs from '../components/tab/Tabs';
import type { TabItem } from '../components/tab/tab.type';
import { UserTable } from '../components/table/UserTable';
import { PostTable } from '../components/table/PostTable';
import { UseFetchUsers } from '../hooks/fetchUsers';
import { UseFetchPosts } from '../hooks/fetchPosts';
import { Pagination } from '../components/pagination/Pagination';
import { postStore } from '../stores/postStore';
import { useAdminActions } from '../hooks/useAdminActions';

export default function AdminDashboard() {
    const { data: usersData, isLoading: usersLoading } = UseFetchUsers();
    const { isLoading: postsLoading } = UseFetchPosts();

    const posts = postStore((state) => state.posts);
    const postsPagination = postStore((state) => state.pagination);

    const users = usersData || [];

    const {
        handleBanUser,
        handleViewPost,
        handleDeletePost,
        handlePostPageChange,
    } = useAdminActions();

    const items: TabItem[] = [
        {
            value: 'users',
            label: 'Utilisateurs',
            icon: <Users className="h-5 w-5" />,
            content: (
                <div className="animate-fade-in px-5">
                    <h2 className="text-2xl font-bold mb-4">
                        Gestion des utilisateurs
                    </h2>
                    <UserTable
                        users={users}
                        onBanUser={handleBanUser}
                        isLoading={usersLoading}
                    />
                </div>
            ),
        },
        {
            value: 'posts',
            label: 'Articles',
            icon: <FileText className="h-5 w-5" />,
            content: (
                <div className="animate-fade-in px-5">
                    <h2 className="text-2xl font-bold mb-4">
                        Gestion des articles
                    </h2>
                    <PostTable
                        posts={posts}
                        onViewPost={handleViewPost}
                        onDeletePost={handleDeletePost}
                        isLoading={postsLoading}
                    />
                    <Pagination
                        page={postsPagination?.page || 1}
                        totalPages={postsPagination?.totalPages || 1}
                        onPageChange={handlePostPageChange}
                    />
                </div>
            ),
        },
    ];

    return <Tabs items={items} />;
}
