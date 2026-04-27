import type { Prisma } from '@prisma/client';
import { z } from 'zod';

const booleanSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return value;
}, z.boolean());

const dateStringSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  'Invalid date',
);

const budgetSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, z.coerce.number().nonnegative('Budget cannot be negative').optional());

const descriptionSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().trim().max(1000).optional());

export const defaultTripSpecs = {
  stayType: 'ANY',
  roomCount: 1,
  roomPreference: 'ANY',
  transportRequired: false,
  transportType: 'ANY',
  mealPlan: 'ANY',
  specialRequirements: '',
} as const;

export const tripSpecsSchema = z
  .object({
    stayType: z.enum(['ANY', 'HOTEL', 'RESORT', 'GUEST_HOUSE']).default(
      defaultTripSpecs.stayType,
    ),
    roomCount: z.coerce
      .number()
      .int('Room count must be a whole number')
      .min(1, 'At least one room is required')
      .default(defaultTripSpecs.roomCount),
    roomPreference: z
      .enum(['ANY', 'SINGLE', 'DOUBLE', 'FAMILY'])
      .default(defaultTripSpecs.roomPreference),
    transportRequired: booleanSchema.default(defaultTripSpecs.transportRequired),
    transportType: z
      .enum(['ANY', 'CAR', 'SUV', 'VAN', 'BUS'])
      .default(defaultTripSpecs.transportType),
    mealPlan: z
      .enum(['ANY', 'BREAKFAST_ONLY', 'HALF_BOARD', 'FULL_BOARD'])
      .default(defaultTripSpecs.mealPlan),
    specialRequirements: z
      .string()
      .trim()
      .max(500, 'Special requirements must be 500 characters or less')
      .default(defaultTripSpecs.specialRequirements),
  })
  .transform((value) => ({
    ...value,
    transportType: value.transportRequired ? value.transportType : 'ANY',
  }));

export const tripRequestFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['PENDING', 'ACCEPTED', 'CANCELLED']).optional(),
  search: z.string().trim().min(1).optional(),
});

export const createTripRequestSchema = z
  .object({
    destination: z
      .string()
      .trim()
      .min(1, 'Destination is required')
      .max(120, 'Destination must be 120 characters or less'),
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    budget: budgetSchema,
    travelers: z.coerce
      .number()
      .int('Travelers must be a whole number')
      .min(1, 'At least one traveler is required')
      .max(100, 'Traveler count is too high')
      .default(1),
    description: descriptionSchema,
    tripSpecs: tripSpecsSchema.default(defaultTripSpecs),
    hotelId: z.string().optional(),
    roomId: z.string().optional(),
    vehicleId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be on or after start date',
      });
    }
  });

export const updateTripRequestSchema = z
  .object({
    destination: z
      .string()
      .trim()
      .min(1, 'Destination is required')
      .max(120, 'Destination must be 120 characters or less')
      .optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    budget: z.preprocess((value) => {
      if (value === '') {
        return null;
      }

      return value;
    }, z.coerce.number().nonnegative('Budget cannot be negative').nullable().optional()),
    travelers: z.coerce
      .number()
      .int('Travelers must be a whole number')
      .min(1, 'At least one traveler is required')
      .max(100, 'Traveler count is too high')
      .optional(),
    description: z.preprocess((value) => {
      if (value === null || value === undefined) {
        return value;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      }

      return value;
    }, z.string().trim().max(1000).nullable().optional()),
    tripSpecs: tripSpecsSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type TripSpecs = z.infer<typeof tripSpecsSchema>;
export type TripRequestFiltersInput = z.infer<typeof tripRequestFiltersSchema>;
export type CreateTripRequestInput = z.infer<typeof createTripRequestSchema>;
export type UpdateTripRequestInput = z.infer<typeof updateTripRequestSchema>;

export interface TripRequestResponse {
  id: string;
  userId: string;
  userName?: string;
  hotelId?: string | null;
  roomId?: string | null;
  vehicleId?: string | null;
  hotel?: {
    id: string;
    name: string;
    city: string;
  } | null;
  room?: {
    id: string;
    type: string;
    price: number;
  } | null;
  roomAvailabilityCount?: number;
  vehicle?: {
    id: string;
    type: string;
    make: string;
    model: string;
    pricePerDay: number;
  } | null;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number | null;
  travelers: number;
  description: string | null;
  tripSpecs: TripSpecs;
  status: string;
  bidsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export function normalizeTripSpecs(input: unknown): TripSpecs {
  const parsed = tripSpecsSchema.safeParse(input ?? {});
  if (parsed.success) {
    return parsed.data;
  }

  return tripSpecsSchema.parse({});
}

export function tripSpecsToJson(tripSpecs: TripSpecs): Prisma.InputJsonObject {
  return tripSpecs as unknown as Prisma.InputJsonObject;
}
