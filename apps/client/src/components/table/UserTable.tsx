import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type { SimplyUser } from '../../modules/types/user.type';
import { TableComponent } from './Table';

interface Props {
    users: SimplyUser[];
    onBanUser?: (userId: string) => void;
    onUnbanUser?: (userId: string) => void;
    isLoading?: boolean;
}

const columnHelper = createColumnHelper<SimplyUser>();

export function UserTable({ users, onBanUser, onUnbanUser, isLoading = false }: Props) {

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
            columnHelper.accessor('bannedAt', {
                header: 'Date de bannissement',
                cell: (info) =>
                    info.getValue() ? new Date(info.getValue()?? "").toLocaleDateString('fr-FR') : 'N/A',
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: (props) => {
                    const isBanned = !!props.row.original.bannedAt;
                    return (
                        <button
                            className={`btn btn-sm ${isBanned ? 'btn-success' : 'btn-error'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isBanned) {
                                    onUnbanUser?.(props.row.original._id);
                                } else {
                                    onBanUser?.(props.row.original._id);
                                }
                            }}
                        >
                            {isBanned ? 'Dé-ban' : 'Ban'}
                        </button>
                    );
                },
            }),
        ],
        [onBanUser, onUnbanUser],
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
