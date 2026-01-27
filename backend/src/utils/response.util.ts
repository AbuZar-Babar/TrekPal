import { Response } from 'express';

/**
 * Standardized API response utility
 */
export const sendSuccess = (res: Response, data: unknown, message?: string, statusCode = 200): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res: Response, message: string, statusCode = 400, errors?: unknown): void => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

