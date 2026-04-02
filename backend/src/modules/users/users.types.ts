import { z } from 'zod';

import {
  normalizeTravelerKycStatus as normalizeTravelerKycStatusValue,
  type TravelerKycStatus,
} from '../../config/constants';

const phoneSchema = z
  .string()
  .trim()
  .min(5, 'Phone number is required')
  .max(30, 'Phone number is too long');

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

const dateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')
  .refine((value) => new Date(value) <= new Date(), 'Date of birth cannot be in the future');

export const updateProfileSchema = z
  .object({
    name: optionalTrimmedString(120),
    phone: optionalTrimmedString(30),
    avatar: optionalTrimmedString(500),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const submitTravelerKycSchema = z.object({
  cnic: z.string().regex(/^\d{13}$/, 'CNIC must be exactly 13 digits'),
  dateOfBirth: dateStringSchema,
  city: z.string().trim().min(2, 'City is required').max(120, 'City is too long'),
  residentialAddress: z
    .string()
    .trim()
    .min(10, 'Residential address is required')
    .max(300, 'Residential address is too long'),
  emergencyContactName: z
    .string()
    .trim()
    .min(2, 'Emergency contact name is required')
    .max(120, 'Emergency contact name is too long'),
  emergencyContactPhone: phoneSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SubmitTravelerKycInput = z.infer<typeof submitTravelerKycSchema>;

export interface UserProfileResponse {
  id: string;
  authUid: string;
  email: string;
  name: string | null;
  phone: string | null;
  cnic: string | null;
  cnicVerified: boolean;
  travelerKycStatus: TravelerKycStatus;
  dateOfBirth: Date | null;
  city: string | null;
  residentialAddress: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  cnicFrontImageUrl: string | null;
  selfieImageUrl: string | null;
  avatar: string | null;
  kycSubmittedAt: Date | null;
  kycVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const normalizeTravelerKycStatus = (
  value: unknown,
): TravelerKycStatus => normalizeTravelerKycStatusValue(value);
