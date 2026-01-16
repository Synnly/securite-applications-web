import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BanUser } from './fetchUsers';
import { deletePost } from './fetchPosts';
import { postStore } from '../stores/postStore';

export const useAdminActions = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const setPostFilters = postStore((state) => state.setFilters);

    const handleBanUser = async (userId: string) => {
        try {
            await BanUser(userId);
            await queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Utilisateur banni avec succès');
        } catch (error) {
            toast.error("Erreur lors du bannissement de l'utilisateur");
        }
    };

    const handleViewPost = (postId: string) => {
        navigate(`/post/${postId}`);
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            return;
        }

        try {
            await deletePost(postId);
            await queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Article supprimé avec succès');
        } catch (error) {
            toast.error("Erreur lors de la suppression de l'article");
        }
    };

    const handlePostPageChange = (page: number) => {
        setPostFilters({ page });
    };

    return {
        handleBanUser,
        handleViewPost,
        handleDeletePost,
        handlePostPageChange,
    };
};
