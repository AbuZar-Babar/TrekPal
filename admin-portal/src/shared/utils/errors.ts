export const extractErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const candidate = error as {
      message?: string;
      response?: { data?: { message?: string } };
    };

    if (candidate.response?.data?.message) {
      return candidate.response.data.message;
    }

    if (candidate.message) {
      return candidate.message;
    }
  }

  return fallback;
};
