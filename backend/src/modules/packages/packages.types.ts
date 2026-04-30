import { z } from 'zod';

const booleanFilterSchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => (typeof value === 'boolean' ? value : value === 'true'));

export const packageFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().min(1).optional(),
  active: booleanFilterSchema.optional(),
});

export const createPackageSchema = z.object({
  name: z.string().trim().min(2, 'Trip offer name is required'),
  description: z.string().trim().optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  duration: z.coerce.number().int().min(1, 'Duration must be at least 1 day'),
  startDate: z.coerce.date().optional(),
  maxSeats: z.coerce.number().int().min(1, 'Max seats must be at least 1').optional(),
  hotelId: z.string().trim().min(1).nullable().optional(),
  hotelIds: z.array(z.string().trim().min(1)).optional().default([]),
  vehicleId: z.string().trim().min(1).nullable().optional(),
  destinations: z
    .array(z.string().trim().min(1, 'Destination cannot be empty'))
    .min(1, 'Add at least one destination'),
  images: z.array(z.string().url('Each image must be a valid URL')).default([]),
  isActive: z.boolean().optional().default(true),
});

export const updatePackageSchema = createPackageSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);

export const applyPackageSchema = z.object({}).strict();

export type PackageFiltersInput = z.infer<typeof packageFiltersSchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type ApplyPackageInput = z.infer<typeof applyPackageSchema>;

export interface PackageParticipantPreview {
  userId: string;
  travelerName: string;
  initials: string;
  age: number | null;
  gender: string | null;
  avatar: string | null;
  bookingStatus: string;
  joinedAt: Date;
}

export interface PackageResponse {
  id: string;
  agencyId: string;
  agencyName: string;
  hotelId: string | null;
  hotelIds: string[];
  vehicleId: string | null;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  startDate: Date | null;
  maxSeats: number;
  confirmedSeats: number;
  remainingSeats: number;
  isSoldOut: boolean;
  destinations: string[];
  images: string[];
  isActive: boolean;
  participantCount: number;
  participants: PackageParticipantPreview[];
  hotel: {
    id: string;
    name: string;
    city: string;
    country: string;
    rating: number | null;
    image: string | null;
    images: string[];
  } | null;
  hotels: Array<{
    id: string;
    name: string;
    city: string;
    country: string;
    rating: number | null;
    image: string | null;
    images: string[];
  }>;
  vehicle: {
    id: string;
    type: string;
    make: string;
    model: string;
    capacity: number;
    image: string | null;
    images: string[];
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
