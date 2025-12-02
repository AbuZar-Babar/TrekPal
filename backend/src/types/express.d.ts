import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Extend Express Request type globally
 */
declare global {
  namespace Express {
    interface Request extends AuthRequest {}
  }
}

export {};

