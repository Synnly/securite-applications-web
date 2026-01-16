import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type { SimplyUser } from '../../modules/types/user.type';
import { TableComponent } from './Table';

interface Props {
    users: SimplyUser[];
    onBanUser?: (userId: string) => void;
    isLoading?: boolean;
}

const columnHelper = createColumnHelper<SimplyUser>();

export function UserTable({ users, onBanUser, isLoading = false }: Props) {

    const columns = useMemo(
        () => [
            columnHelper.accessor('email', {
                header: 'Email',
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
                    <button
                        className="btn btn-error btn-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onBanUser?.(props.row.original._id);
                        }}
                    >
                        Ban
                    </button>
                ),
            }),
        ],
        [onBanUser],
    );

    return (
        <TableComponent
            columns={columns}
            data={users}
            isLoading={isLoading}
            emptyMessage="Aucun utilisateur"
            getRowId={(row) => row._id}
        />
    );
}
