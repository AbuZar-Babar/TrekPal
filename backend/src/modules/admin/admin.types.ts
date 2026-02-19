import { z } from 'zod';
import { APPROVAL_STATUS } from '../../config/constants';

/**
 * Admin request/response types
 */

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

// Agency Response Type
export interface AgencyResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  license: string | null;
  status: string;
  ownerName: string | null;
  cnic: string | null;
  cnicImageUrl: string | null;
  ownerPhotoUrl: string | null;
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
  cnicVerified: boolean;
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
