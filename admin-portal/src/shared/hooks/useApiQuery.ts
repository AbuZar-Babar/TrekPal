import { UseQueryOptions, useQuery } from '@tanstack/react-query';

/**
 * Shared API Query Hook
 * Standardizes data fetching across all admin modules
 * 
 * @template T - The data type returned by the fetcher
 * @param queryKey - Unique key for this query (e.g., ['agencies', 'list'])
 * @param fetcher - Function that fetches the data
 * @param options - Optional React Query options
 * 
 * @example
 * const { data, isLoading, error } = useApiQuery(
 *   ['agencies', 'list'],
 *   () => agencyService.getAll()
 * );
 */
export function useApiQuery<T>(
    queryKey: Array<string | number | boolean | Record<string, any>>,
    fetcher: () => Promise<T>,
    options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<T, Error>({
        queryKey,
        queryFn: fetcher,
        retry: 2, // Retry failed requests twice
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        ...options,
    });
}
