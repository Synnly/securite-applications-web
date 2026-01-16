import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type { Comment } from '../../modules/types/comment.type';
import { TableComponent } from './Table';

interface Props {
    comments: Comment[];
    onViewComment?: (commentId: string) => void;
    onDeleteComment?: (commentId: string) => void;
    isLoading?: boolean;
}

const columnHelper = createColumnHelper<Comment>();

export function CommentTable({
    comments,
    onViewComment,
    onDeleteComment,
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
            columnHelper.accessor('text', {
                header: 'Texte',
                cell: (info) => {
                    const text = info.getValue();
                    return text.length > 50
                        ? `${text.substring(0, 50)}...`
                        : text;
                },
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
                                onViewComment?.(props.row.original.id);
                            }}
                        >
                            Voir
                        </button>
                        <button
                            className="btn btn-error btn-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteComment?.(props.row.original.id);
                            }}
                        >
                            Supprimer
                        </button>
                    </div>
                ),
            }),
        ],
        [onViewComment, onDeleteComment],
    );

    return (
        <TableComponent
            columns={columns}
            data={comments}
            isLoading={isLoading}
            emptyMessage="Aucun commentaire"
            getRowId={(row) => row.id}
        />
    );
}
