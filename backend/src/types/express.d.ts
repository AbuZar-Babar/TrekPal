/**
 * Extend Express Request type globally
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        role: string;
      };
    }
  }
}

export {};

