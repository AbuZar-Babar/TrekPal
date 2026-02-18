import { UseMutationOptions, useMutation, useQueryClient } from '@tantml:query';

/**
 * Shared API Mutation Hook
 * Standardizes data mutations (create, update, delete) across all admin modules
 * 
 * @template TData - The data type returned by the mutation
 * @template TVariables - The variables type passed to the mutation
 * @param mutationFn - Function that performs the mutation
 * @param options - Optional React Query mutation options
 * 
 * @example
 * const { mutate, isLoading } = useApiMutation(
 *   (id: string) => agencyService.approve(id),
 *   {
 *     onSuccess: () => {
 *       toast.success('Agency approved');
 *     }
 *   }
 * );
 */
export function useApiMutation<TData = unknown, TVariables = void>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
    const queryClient = useQueryClient();

    return useMutation<TData, Error, TVariables>({
        mutationFn,
        onError: (error) => {
            console.error('[API Mutation Error]', error);
        },
        ...options,
    });
}
