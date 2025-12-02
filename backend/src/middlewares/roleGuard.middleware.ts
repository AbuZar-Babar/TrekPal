import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ROLES, UserRole } from '../config/constants';

/**
 * Role-based access control middleware
 * Ensures user has required role(s) to access the route
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userRole = req.user.role as UserRole;
    console.log(`[RoleGuard] Checking role - User role: ${userRole}, Allowed roles: ${allowedRoles.join(', ')}`);
    
    if (!allowedRoles.includes(userRole)) {
      console.log(`[RoleGuard] Access denied - User role ${userRole} not in allowed roles`);
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    console.log(`[RoleGuard] Access granted - User role ${userRole} is allowed`);
    next();
  };
};

/**
 * Require traveler role
 */
export const requireTraveler = requireRole(ROLES.TRAVELER);

/**
 * Require agency role
 */
export const requireAgency = requireRole(ROLES.AGENCY);

/**
 * Require admin role
 */
export const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Require agency or admin role
 */
export const requireAgencyOrAdmin = requireRole(ROLES.AGENCY, ROLES.ADMIN);

