import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BanUser, UnbanUser } from './fetchUsers';
import { deletePost } from './fetchPosts';
import { postStore } from '../stores/postStore';
import type { ConfirmAction } from './useConfirmModal';

type UseAdminActionsProps = {
    openConfirm: (action: ConfirmAction) => void;
};

export const useAdminActions = ({ openConfirm }: UseAdminActionsProps) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const setPostFilters = postStore((state) => state.setFilters);

    const handleBanUser = async (userId: string) => {
        openConfirm({
            title: "Bannir l'utilisateur",
            message: 'Êtes-vous sûr de vouloir bannir cet utilisateur ?',
            confirmText: 'Bannir',
            confirmClassName: 'btn-error',
            onConfirm: async () => {
                try {
                    await BanUser(userId);
                    await queryClient.invalidateQueries({ queryKey: ['users'] });
                    toast.success('Utilisateur banni avec succès');
                } catch (error) {
                    toast.error("Erreur lors du bannissement de l'utilisateur");
                }
            },
        });
    };

    const handleUnbanUser = async (userId: string) => {
        openConfirm({
            title: "Dé-bannir l'utilisateur",
            message: 'Êtes-vous sûr de vouloir dé-bannir cet utilisateur ?',
            confirmText: 'Dé-bannir',
            confirmClassName: 'btn-success',
            onConfirm: async () => {
                try {
                    await UnbanUser(userId);
                    await queryClient.invalidateQueries({ queryKey: ['users'] });
                    toast.success('Utilisateur dé-banni avec succès');
                } catch (error) {
                    toast.error("Erreur lors du dé-bannissement de l'utilisateur");
                }
            },
        });
    };

    const handleViewPost = (postId: string) => {
        navigate(`/post/${postId}`);
    };

    const handleDeletePost = async (postId: string) => {
        openConfirm({
            title: "Supprimer l'article",
            message: 'Êtes-vous sûr de vouloir supprimer cet article ?',
            confirmText: 'Supprimer',
            confirmClassName: 'btn-error',
            onConfirm: async () => {
                try {
                    await deletePost(postId);
                    await queryClient.invalidateQueries({ queryKey: ['posts'] });
                    toast.success('Article supprimé avec succès');
                } catch (error) {
                    toast.error("Erreur lors de la suppression de l'article");
                }
            },
        });
    };

    const handlePostPageChange = (page: number) => {
        setPostFilters({ page });
    };

    return {
        handleBanUser,
        handleUnbanUser,
        handleViewPost,
        handleDeletePost,
        handlePostPageChange,
    };
};
