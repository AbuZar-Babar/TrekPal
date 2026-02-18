import axios, { AxiosError } from 'axios';

/**
 * API Error Type
 */
export interface ApiError {
    message: string;
    statusCode?: number;
    isNetworkError: boolean;
    isAuthError: boolean;
}

/**
 * Handle API Errors
 * Standardizes error handling across all API calls
 * 
 * @param error - The error from axios or other source
 * @returns Formatted error object
 * 
 * @example
 * try {
 *   await agencyService.approve(id);
 * } catch (error) {
 *   const apiError = handleApiError(error);
 *   toast.error(apiError.message);
 * }
 */
export function handleApiError(error: any): ApiError {
    // Check if it's an Axios error
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;

        // Network error (backend not running)
        if (!axiosError.response) {
            return {
                message: '❌ Backend server is not running. Please start the backend server.',
                isNetworkError: true,
                isAuthError: false,
            };
        }

        // Authentication error
        if (axiosError.response.status === 401) {
            return {
                message: '🔒 Session expired. Please log in again.',
                statusCode: 401,
                isNetworkError: false,
                isAuthError: true,
            };
        }

        // Authorization error
        if (axiosError.response.status === 403) {
            return {
                message: '⛔ Access denied. You do not have permission to perform this action.',
                statusCode: 403,
                isNetworkError: false,
                isAuthError: true,
            };
        }

        // Validation error
        if (axiosError.response.status === 400) {
            const message = axiosError.response.data?.message || 'Invalid request. Please check your input.';
            return {
                message: `⚠️ ${message}`,
                statusCode: 400,
                isNetworkError: false,
                isAuthError: false,
            };
        }

        // Server error
        if (axiosError.response.status >= 500) {
            return {
                message: '🔥 Server error. Please try again later or contact support.',
                statusCode: axiosError.response.status,
                isNetworkError: false,
                isAuthError: false,
            };
        }

        // Other HTTP errors
        const message = axiosError.response.data?.message || axiosError.message || 'An unexpected error occurred.';
        return {
            message,
            statusCode: axiosError.response.status,
            isNetworkError: false,
            isAuthError: false,
        };
    }

    // Generic error
    return {
        message: error?.message || 'An unexpected error occurred.',
        isNetworkError: false,
        isAuthError: false,
    };
}

/**
 * Get user-friendly error message
 * 
 * @param error - Any error object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: any): string {
    const apiError = handleApiError(error);
    return apiError.message;
}
