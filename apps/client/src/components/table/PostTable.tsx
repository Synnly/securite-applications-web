import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { TableComponent } from './Table';
import type { Post } from '../../modules/types/post.type';

interface Props {
    posts: Post[];
    onViewPost?: (postId: string) => void;
    onDeletePost?: (postId: string) => void;
    isLoading?: boolean;
}

const columnHelper = createColumnHelper<Post>();

export function PostTable({
    posts,
    onViewPost,
    onDeletePost,
    isLoading = false,
}: Props) {
    const columns = useMemo(
        () => [
            columnHelper.accessor('author', {
                header: 'Auteur',
                cell: (info) => {
                    const author = info.getValue();
                    if (typeof author === 'object' && author !== null) {
                        return (author as any).email || 'Inconnu';
                    }
                    return author || 'Inconnu';
                },
            }),
            columnHelper.accessor('title', {
                header: 'Titre',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('createdAt', {
                header: 'Date de création',
                cell: (info) =>
                    new Date(info.getValue()).toLocaleDateString('fr-FR'),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: (props) => (
                    <div className="flex gap-2">
                        <button
                            className="btn btn-info btn-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewPost?.(props.row.original.id);
                            }}
                        >
                            Voir
                        </button>
                        <button
                            className="btn btn-error btn-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeletePost?.(props.row.original.id);
                            }}
                        >
                            Supprimer
                        </button>
                    </div>
                ),
            }),
        ],
        [onViewPost, onDeletePost],
    );

    return (
        <TableComponent
            columns={columns}
            data={posts}
            isLoading={isLoading}
            emptyMessage="Aucun article"
            getRowId={(row) => row.id}
        />
    );
}
