import { z } from 'zod';

/**
 * Auth request/response types
 */

const legalEntityTypeSchema = z.enum(['SOLE_PROPRIETOR', 'PARTNERSHIP', 'COMPANY']);

const parseStringArray = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : value;
    } catch {
      return value;
    }
  }

  if (trimmed.includes(',')) {
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [trimmed];
};

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
// Note: document URL fields are populated by the controller after multer processes the files.
export const agencyRegisterSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().trim().min(2, 'Agency name must be at least 2 characters'),
    phone: z.string().trim().min(5, 'Phone number is required'),
    address: z.string().trim().min(5, 'Office address is required'),
    officeCity: z.string().trim().min(2, 'Office city is required'),
    jurisdiction: z.enum(
      ['ICT', 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'AJK', 'Gilgit-Baltistan'],
      {
        required_error: 'Jurisdiction is required',
        invalid_type_error: 'Jurisdiction is required',
      }
    ),
    legalEntityType: legalEntityTypeSchema,
    license: z.string().trim().min(1, 'Tourism license number is required'),
    ntn: z.string().trim().min(1, 'NTN is required'),
    ownerName: z.string().trim().min(2, 'Representative name must be at least 2 characters'),
    cnic: z.string().regex(/^\d{13}$/, 'CNIC must be exactly 13 digits'),
    fieldOfOperations: z.preprocess(
      parseStringArray,
      z.array(z.string().trim().min(1, 'Field of operation cannot be empty'))
        .min(1, 'Select at least one field of operation')
    ),
    capitalAvailablePkr: z.coerce.number()
      .int('Capital must be a whole number')
      .min(400000, 'Capital available must be at least PKR 400,000'),
    secpRegistrationNumber: z.string().trim().optional(),
    partnershipRegistrationNumber: z.string().trim().optional(),
  }).superRefine((data, ctx) => {
    if (data.legalEntityType === 'COMPANY' && !data.secpRegistrationNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secpRegistrationNumber'],
        message: 'SECP registration number is required for companies',
      });
    }

    if (data.legalEntityType === 'PARTNERSHIP' && !data.partnershipRegistrationNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['partnershipRegistrationNumber'],
        message: 'Partnership registration number is required for partnerships',
      });
    }
  }),
});

export type AgencyRegisterInput = z.infer<typeof agencyRegisterSchema>['body'] & {
  cnicImageUrl?: string;
  ownerPhotoUrl?: string;
  licenseCertificateUrl?: string;
  ntnCertificateUrl?: string;
  businessRegistrationProofUrl?: string;
  officeProofUrl?: string;
  bankCertificateUrl?: string;
  additionalSupportingDocumentUrl?: string;
};

// Login Schema (for both user and agency)
// Supports both Supabase token and email/password
export const loginSchema = z.object({
  body: z.object({
    supabaseToken: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().optional(),
  }).refine(
    (data) => data.supabaseToken || (data.email && data.password),
    {
      message: 'Either supabaseToken or email/password is required',
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
    authUid: string;
    email: string;
    name: string | null;
    phone?: string | null;
    cnic?: string | null;
    cnicVerified?: boolean;
    travelerKycStatus?: string;
    dateOfBirth?: Date | null;
    city?: string | null;
    residentialAddress?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    kycSubmittedAt?: Date | null;
    kycVerifiedAt?: Date | null;
    status?: string;
    role: string;
  };
  token: string;
  refreshToken?: string;
}
