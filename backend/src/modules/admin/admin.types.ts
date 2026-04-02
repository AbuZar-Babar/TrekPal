import { z } from 'zod';

/**
 * Admin request/response types
 */

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }, z.string().trim().max(maxLength).nullable().optional());

const optionalTrimmedRequiredString = (minLength: number, maxLength: number) =>
  z.string().trim().min(minLength).max(maxLength).optional();

const travelerKycStatusSchema = z.enum([
  'NOT_SUBMITTED',
  'PENDING',
  'VERIFIED',
  'REJECTED',
]);

// Approve/Reject Schema
export const approveRejectSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    reason: z.string().optional(),
  }).optional(),
});

// Pagination Schema
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    search: z.string().optional(),
  }),
});

export const userPaginationSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    status: travelerKycStatusSchema.optional(),
    search: z.string().optional(),
  }),
});

export const updateAgencySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z
    .object({
      name: optionalTrimmedRequiredString(2, 160),
      email: z.string().trim().email('Invalid email address').optional(),
      phone: optionalTrimmedString(30),
      address: optionalTrimmedString(300),
      officeCity: optionalTrimmedString(120),
      jurisdiction: optionalTrimmedString(120),
      ownerName: optionalTrimmedString(120),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z
    .object({
      name: optionalTrimmedRequiredString(2, 120),
      email: z.string().trim().email('Invalid email address').optional(),
      phone: optionalTrimmedString(30),
      cnic: z
        .preprocess((value) => {
          if (value === null || value === undefined) {
            return value;
          }

          if (typeof value !== 'string') {
            return value;
          }

          const trimmed = value.trim();
          return trimmed.length === 0 ? null : trimmed;
        }, z.string().regex(/^\d{13}$/, 'CNIC must be exactly 13 digits').nullable().optional()),
      city: optionalTrimmedString(120),
      residentialAddress: optionalTrimmedString(300),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
});

export type UpdateAgencyInput = z.infer<typeof updateAgencySchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];

// Agency Response Type
export interface AgencyResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  officeCity: string | null;
  jurisdiction: string | null;
  legalEntityType: string | null;
  license: string | null;
  ntn: string | null;
  secpRegistrationNumber: string | null;
  partnershipRegistrationNumber: string | null;
  fieldOfOperations: string[];
  capitalAvailablePkr: number | null;
  status: string;
  ownerName: string | null;
  cnic: string | null;
  cnicImageUrl: string | null;
  ownerPhotoUrl: string | null;
  licenseCertificateUrl: string | null;
  ntnCertificateUrl: string | null;
  businessRegistrationProofUrl: string | null;
  officeProofUrl: string | null;
  bankCertificateUrl: string | null;
  additionalSupportingDocumentUrl: string | null;
  applicationSubmittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  hotelsCount?: number;
  vehiclesCount?: number;
}

// Hotel Response Type
export interface HotelResponse {
  id: string;
  agencyId: string;
  agencyName: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  rating: number | null;
  status: string;
  images: string[];
  amenities: string[];
  createdAt: Date;
  roomsCount?: number;
}

// Vehicle Response Type
export interface VehicleResponse {
  id: string;
  agencyId: string;
  agencyName: string;
  type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  pricePerDay: number;
  status: string;
  isAvailable: boolean;
  images: string[];
  createdAt: Date;
}

// User Response Type
export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  cnic: string | null;
  city: string | null;
  residentialAddress: string | null;
  cnicVerified: boolean;
  travelerKycStatus: string;
  cnicFrontImageUrl: string | null;
  selfieImageUrl: string | null;
  kycSubmittedAt: Date | null;
  kycVerifiedAt: Date | null;
  createdAt: Date;
  bookingsCount?: number;
  tripRequestsCount?: number;
}

// Dashboard Stats Type
export interface DashboardStats {
  totalUsers: number;
  totalAgencies: number;
  approvedAgencies: number;
  pendingAgencies: number;
  pendingTravelers: number;
  verifiedTravelers: number;
  totalHotels: number;
  approvedHotels: number;
  pendingHotels: number;
  totalVehicles: number;
  approvedVehicles: number;
  pendingVehicles: number;
  totalBookings: number;
  totalRevenue: number;
  recentRegistrations: {
    users: number;
    agencies: number;
  };
}
