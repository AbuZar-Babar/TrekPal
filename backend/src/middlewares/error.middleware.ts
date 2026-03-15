import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import multer from 'multer';

/**
 * Global error handler middleware
 * Handles all errors and returns consistent error responses
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: 'Duplicate entry',
        message: 'A record with this information already exists',
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        error: 'Not found',
        message: 'The requested record was not found',
      });
      return;
    }
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Each uploaded file must be 10MB or smaller'
      : err.message;

    res.status(400).json({
      error: 'Upload error',
      message,
    });
    return;
  }

  if (err.message.includes('Only PDF, JPEG, PNG, and WebP files are allowed')) {
    res.status(400).json({
      error: 'Upload error',
      message: err.message,
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

