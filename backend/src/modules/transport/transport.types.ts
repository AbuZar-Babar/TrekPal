import { z } from 'zod';

/**
 * Transport/Vehicle Types
 */

// Create Vehicle Schema
export const createVehicleSchema = z.object({
  body: z.object({
    type: z.string().min(1, 'Vehicle type is required'),
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    capacity: z.number().int().min(1, 'Capacity must be at least 1'),
    pricePerDay: z.number().min(0, 'Price must be non-negative'),
    images: z.array(z.string().url()).optional(),
    isAvailable: z.boolean().optional().default(true),
  }),
});

// Update Vehicle Schema
export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Vehicle ID is required'),
  }),
  body: z.object({
    type: z.string().min(1).optional(),
    make: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    capacity: z.number().int().min(1).optional(),
    pricePerDay: z.number().min(0).optional(),
    images: z.array(z.string().url()).optional(),
    isAvailable: z.boolean().optional(),
  }),
});

// Get Vehicles Query Schema
export const getVehiclesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    search: z.string().optional(),
  }),
});

// TypeScript Types
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>['body'];
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>['body'];

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
