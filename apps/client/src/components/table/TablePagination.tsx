import type { Table as TanTable } from '@tanstack/react-table';
import { Pagination } from '../pagination/Pagination';

interface Props<TData> {
    table: TanTable<TData>;
}

export function TablePagination<TData>({ table }: Props<TData>) {
    const state = table.getState().pagination;
    const pageIndex = state.pageIndex ?? 0;
    const pageCount = table.getPageCount();

    const handlePageChange = (pageOneBased: number) => {
        const idx = Math.max(1, Math.min(pageOneBased, pageCount)) - 1;
        table.setPageIndex(idx);
    };

    return (
        <div className="mt-4">
            <Pagination
                page={pageIndex + 1}
                totalPages={Math.max(1, pageCount)}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
