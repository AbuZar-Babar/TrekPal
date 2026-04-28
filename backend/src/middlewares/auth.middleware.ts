import { Request, Response, NextFunction } from 'express';
import { verifySupabaseAccessToken, isSupabaseConfigured } from '../config/supabase';
import { generateJWT, verifyJWT } from '../utils/jwt.util';
import { APPROVAL_STATUS, ROLES } from '../config/constants';
import { PrismaAgencyRepository } from '../repositories';

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

const normalizeRole = (role: unknown): string => {
  if (typeof role !== 'string') {
    return ROLES.TRAVELER;
  }

  const normalizedRole = role.toUpperCase();
  if (
    normalizedRole === ROLES.TRAVELER
    || normalizedRole === ROLES.AGENCY
    || normalizedRole === ROLES.ADMIN
    || normalizedRole === ROLES.HOTEL
  ) {
    return normalizedRole;
  }

  return ROLES.TRAVELER;
};

const agencyRepo = new PrismaAgencyRepository();

/**
 * Authentication middleware
 * Accepts backend JWT first, then Supabase access token.
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

    const token = authHeader.substring(7);

    // Try backend JWT first.
    let decodedToken: { uid: string; email: string; role: string };
    try {
      const jwtPayload = verifyJWT(token);
      decodedToken = {
        uid: jwtPayload.uid,
        email: jwtPayload.email,
        role: normalizeRole(jwtPayload.role),
      };
    } catch {
      if (process.env.NODE_ENV === 'development' && token.length < 100) {
        const tokenLower = token.toLowerCase();
        const isAdminToken = tokenLower.startsWith('admin-dummy-token') || tokenLower.includes('admin');
        decodedToken = {
          uid: isAdminToken ? 'admin-dev-uid-123' : `agency-dev-uid-${token.substring(0, 10)}`,
          email: isAdminToken ? 'admin@trekpal.com' : 'agency@trekpal.com',
          role: isAdminToken ? ROLES.ADMIN : ROLES.AGENCY,
        };
      } else if (isSupabaseConfigured()) {
        const supabaseUser = await verifySupabaseAccessToken(token);
        decodedToken = {
          uid: supabaseUser.id,
          email: supabaseUser.email || '',
          role: normalizeRole(supabaseUser.app_metadata?.role ?? supabaseUser.user_metadata?.role),
        };
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('Supabase auth is not configured, using development mode authentication');
        decodedToken = {
          uid: `dev-uid-${token.substring(0, 10)}`,
          email: 'dev@example.com',
          role: ROLES.TRAVELER,
        };
      } else {
        throw new Error('Invalid or expired token');
      }
    }

    const jwtToken = generateJWT({
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role,
    });

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role,
    };

    if (decodedToken.role === ROLES.AGENCY) {
      const agency =
        (await agencyRepo.findByAuthUid(decodedToken.uid))
        || (decodedToken.email ? await agencyRepo.findByEmail(decodedToken.email) : null);

      if (agency && agency.status !== APPROVAL_STATUS.APPROVED) {
        res.status(403).json({
          error: agency.status === APPROVAL_STATUS.REJECTED
            ? 'Agency account was rejected'
            : 'Agency account is pending approval',
        });
        return;
      }
    }

    res.setHeader('X-Auth-Token', jwtToken);

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
