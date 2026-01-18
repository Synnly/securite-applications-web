import { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
    type Row,
} from '@tanstack/react-table';
import type { TableProps } from './table.types';

export function TableComponent<TData extends Record<string, any>>({
    columns,
    data,
    initialState = {},
    getRowId,
    onRowClick,
    isLoading = false,
    emptyMessage = 'Aucune donnée',
    className = '',
}: TableProps<TData>) {
    const memoColumns = useMemo(() => columns as ColumnDef<TData>[], [columns]);
    const memoData = useMemo(() => data, [data]);

    const table = useReactTable<TData>({
        data: memoData,
        columns: memoColumns,
        getCoreRowModel: getCoreRowModel(),
        initialState,
        getRowId: getRowId as any,
    });

    return (
        <div className={className}>
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <div>
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {isLoading && (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-8"
                                >
                                    <span className="loading loading-spinner loading-md"></span>
                                </td>
                            </tr>
                        )}

                        {!isLoading &&
                            table.getRowModel().rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="text-center py-4"
                                    >
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}

                        {!isLoading &&
                            table.getRowModel().rows.map((row: Row<TData>) => (
                                <tr
                                    key={row.id}
                                    className={
                                        onRowClick
                                            ? 'cursor-pointer hover:bg-base-200'
                                            : ''
                                    }
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
