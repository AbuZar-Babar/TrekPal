/**
 * Type guard to check if error is an Error object
 */
export function isError(error: unknown): error is Error {
    return error instanceof Error;
}

/**
 * Type guard to check if error has a code property
 */
export function hasErrorCode(error: unknown): error is { code: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

/**
 * Type guard to check if error has a message property
 */
export function hasErrorMessage(error: unknown): error is { message: string } {
    return typeof error === 'object' && error !== null && 'message' in error;
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
    if (isError(error)) {
        return error.message;
    }
    if (hasErrorMessage(error)) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unknown error occurred';
}

/**
 * Get error code from unknown error
 */
export function getErrorCode(error: unknown): string | undefined {
    if (hasErrorCode(error)) {
        return error.code;
    }
    return undefined;
}
