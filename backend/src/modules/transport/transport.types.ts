import { z } from 'zod';

/**
 * Transport/Vehicle Types
 */

// Create Vehicle Schema
export const createVehicleSchema = z.object({
  body: z.object({
    driver: z.object({
      name: z.string().min(1, 'Driver name is required'),
      phone: z.string().trim().optional(),
      licenseNumber: z.string().trim().optional(),
    }),
    type: z.string().min(1, 'Vehicle type is required'),
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    capacity: z.number().int().min(1, 'Capacity must be at least 1'),
    pricePerDay: z.number().min(0, 'Price must be non-negative'),
    images: z.array(z.string().url()).optional(),
    isAvailable: z.boolean().optional().default(true),
    vehicleNumber: z.string().min(1).optional(),
  }),
});

// Update Vehicle Schema
export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Vehicle ID is required'),
  }),
  body: z.object({
    driver: z.object({
      name: z.string().min(1).optional(),
      phone: z.string().trim().optional(),
      licenseNumber: z.string().trim().optional(),
    }).optional(),
    type: z.string().min(1).optional(),
    make: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    capacity: z.number().int().min(1).optional(),
    pricePerDay: z.number().min(0).optional(),
    images: z.array(z.string().url()).optional(),
    isAvailable: z.boolean().optional(),
    vehicleNumber: z.string().min(1).optional(),
  }),
});

export const createDriverSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Driver name is required'),
    phone: z.string().min(1, 'Driver phone is required'),
    licenseNumber: z.string().min(1, 'Driver license number is required'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const updateDriverSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Driver ID is required'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    licenseNumber: z.string().min(1).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
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
export type CreateDriverInput = z.infer<typeof createDriverSchema>['body'];
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>['body'];

export interface DriverResponse {
  id: string;
  vehicleProviderId: string;
  name: string;
  phone: string | null;
  licenseNumber: string | null;
  status: string;
  vehicleId: string | null;
  vehicleLabel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleResponse {
  id: string;
  vehicleProviderId: string;
  vehicleProviderName: string;
  driverId: string;
  type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  pricePerDay: number;
  status: string;
  isAvailable: boolean;
  images: string[];
  vehicleNumber?: string | null;
  driver: {
    id: string;
    name: string;
    phone: string | null;
    licenseNumber: string | null;
    status: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
