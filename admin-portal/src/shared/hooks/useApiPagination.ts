import { useState, useCallback } from 'react';
import { useApiQuery } from './useApiQuery';

/**
 * Pagination state
 */
export interface PaginationState {
    page: number;
    limit: number;
    total: number;
}

/**
 * Paginat response structure
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

/**
 * Shared API Pagination Hook
 * Handles paginated data fetching with built-in page/limit state
 * 
 * @template T - The item type in the paginated list
 * @param queryKey - Base query key (page will be appended)
 * @param fetcher - Function that fetches paginated data
 * @param initialPage - Initial page number (default: 1)
 * @param initialLimit - Initial page size (default: 20)
 * 
 * @example
 * const { data, isLoading, page, limit, setPage, setLimit, totalPages } = useApiPagination(
 *   ['agencies'],
 *   (page, limit) => agencyService.getAll({ page, limit })
 * );
 */
export function useApiPagination<T>(
    queryKey: Array<string | number>,
    fetcher: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
    initialPage: number = 1,
    initialLimit: number = 20
) {
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);

    const { data, isLoading, error, refetch } = useApiQuery<PaginatedResponse<T>>(
        [...queryKey, 'paginated', page, limit],
        () => fetcher(page, limit)
    );

    const totalPages = data ? Math.ceil(data.total / limit) : 0;

    const goToPage = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    }, [totalPages]);

    const goToNextPage = useCallback(() => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    }, [page, totalPages]);

    const goToPrevPage = useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    return {
        data: data?.data || [],
        total: data?.total || 0,
        page,
        limit,
        totalPages,
        isLoading,
        error,
        setPage: goToPage,
        setLimit,
        goToNextPage,
        goToPrevPage,
        refetch,
    };
}
