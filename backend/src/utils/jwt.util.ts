import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JWTPayload {
  uid: string;
  email: string;
  role: string;
}

/**
 * Generate JWT token
 * @param payload - User information to encode in token
 * @returns JWT token string
 */
export const generateJWT = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 */
export const verifyJWT = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

