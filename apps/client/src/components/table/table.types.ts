import type { ColumnDef, PaginationState } from '@tanstack/react-table';

export type RowData = Record<string, unknown>;

export type TableColumn<TData extends RowData = RowData> = ColumnDef<
    TData,
    any
>;

export interface TableProps<TData extends RowData = RowData> {
    columns: TableColumn<TData>[];
    data: TData[];
    initialState?: {
        pagination?: Partial<PaginationState>;
    };
    getRowId?: (row: TData) => string;
    onRowClick?: (row: TData) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
}
