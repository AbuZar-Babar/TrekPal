import { z } from 'zod';

export const hotelFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  search: z.string().trim().min(1).optional(),
  discovery: z.coerce.boolean().optional(),
});

export const createHotelSchema = z.object({
  name: z.string().trim().min(1, 'Hotel name is required'),
  description: z.string().trim().optional(),
  address: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  country: z.string().trim().min(1, 'Country is required'),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string().trim().min(1)).default([]),
});

export const updateHotelSchema = createHotelSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' }
);

export type HotelFiltersInput = z.infer<typeof hotelFiltersSchema>;
export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;

export interface HotelResponse {
  id: string;
  agencyId: string | null;
  name: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  images: string[];
  amenities: string[];
  businessDocUrl?: string | null;
  locationImageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  rooms?: any[];
  services?: any[];
}
