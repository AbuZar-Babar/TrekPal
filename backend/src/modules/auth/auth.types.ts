import { z } from 'zod';
import { ROLES } from '../../config/constants';

/**
 * Auth request/response types
 */

// User Registration Schema
export const userRegisterSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    cnic: z.string().length(13, 'CNIC must be 13 digits').optional(),
  }),
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>['body'];

// Agency Registration Schema
export const agencyRegisterSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Agency name must be at least 2 characters'),
    phone: z.string().optional(),
    address: z.string().optional(),
    license: z.string().optional(),
  }),
});

export type AgencyRegisterInput = z.infer<typeof agencyRegisterSchema>['body'];

// Login Schema (for both user and agency)
// Supports both Firebase token and email/password
export const loginSchema = z.object({
  body: z.object({
    firebaseToken: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().optional(),
  }).refine(
    (data) => data.firebaseToken || (data.email && data.password),
    {
      message: 'Either firebaseToken or email/password is required',
    }
  ),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];

// CNIC Verification Schema
export const verifyCnicSchema = z.object({
  body: z.object({
    cnic: z.string().length(13, 'CNIC must be 13 digits'),
    cnicImage: z.string().url('Invalid CNIC image URL').optional(),
  }),
});

export type VerifyCnicInput = z.infer<typeof verifyCnicSchema>['body'];

// Refresh Token Schema
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];

// Auth Response Type
export interface AuthResponse {
  user: {
    id: string;
    firebaseUid: string;
    email: string;
    name: string | null;
    role: string;
  };
  token: string;
  refreshToken?: string;
}
