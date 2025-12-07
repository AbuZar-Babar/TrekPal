import { Request, Response, NextFunction } from 'express';
import { getFirebaseAuth } from '../config/firebase';
import { generateJWT, verifyJWT } from '../utils/jwt.util';
import { ROLES } from '../config/constants';

/**
 * Extended Express Request with user information
 */
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: string;
  };
}

/**
 * JWT wrapper around Firebase Authentication
 * Verifies Firebase token and attaches user info to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Try to verify as JWT token first (from our backend login)
    let decodedToken: any;
    
    try {
      // First, try to verify as JWT token (from our backend)
      const jwtPayload = verifyJWT(token);
      console.log(`[Auth] JWT token verified - Role: ${jwtPayload.role}, Email: ${jwtPayload.email}, UID: ${jwtPayload.uid}`);
      decodedToken = jwtPayload;
    } catch (jwtError) {
      // Not a JWT token, try other methods
      if (process.env.NODE_ENV === 'development' && token.length < 100) {
        // Development mode: Simple token (for testing)
        // Check token prefix to determine role
        // Admin tokens: 'admin-dummy-token-'
        // Agency tokens: 'dummy-token-' (or anything else)
        const tokenLower = token.toLowerCase();
        const isAdminToken = tokenLower.startsWith('admin-dummy-token') || tokenLower.includes('admin');
        console.log(`[Auth] Development mode - Token: ${token.substring(0, 40)}..., isAdmin: ${isAdminToken}`);
        decodedToken = {
          uid: isAdminToken ? 'admin-firebase-uid-123' : `agency-firebase-uid-${token.substring(0, 10)}`,
          email: isAdminToken ? 'admin@trekpal.com' : 'agency@trekpal.com',
          role: isAdminToken ? ROLES.ADMIN : ROLES.AGENCY,
        };
        console.log(`[Auth] Decoded token - Role: ${decodedToken.role}, Email: ${decodedToken.email}, UID: ${decodedToken.uid}`);
      } else {
        // Production: Verify with Firebase
        try {
          const firebaseAuth = getFirebaseAuth();
          decodedToken = await firebaseAuth.verifyIdToken(token);
        } catch (error) {
          // If Firebase is not configured, fall back to development mode
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️  Firebase not configured, using development mode authentication');
            decodedToken = {
              uid: `dev-uid-${token.substring(0, 10)}`,
              email: 'dev@example.com',
              role: ROLES.TRAVELER,
            };
          } else {
            throw error;
          }
        }
      }
    }

    // Generate JWT for our backend
    const jwtToken = generateJWT({
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role || ROLES.TRAVELER,
    });

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role || ROLES.TRAVELER,
    };

    // Attach JWT to response header for client to use
    res.setHeader('X-Auth-Token', jwtToken);

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

