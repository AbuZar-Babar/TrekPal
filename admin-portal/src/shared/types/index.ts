/**
 * Shared TypeScript types
 */

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: 'TRAVELER' | 'AGENCY' | 'ADMIN';
}

export interface Agency {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  license: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  hotelsCount?: number;
  vehiclesCount?: number;
}

export interface Hotel {
  id: string;
  agencyId: string;
  agencyName: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  rating: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  images: string[];
  amenities: string[];
  createdAt: string;
  roomsCount?: number;
}

export interface Vehicle {
  id: string;
  agencyId: string;
  agencyName: string;
  type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  pricePerDay: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isAvailable: boolean;
  images: string[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  cnic: string | null;
  cnicVerified: boolean;
  createdAt: string;
  bookingsCount?: number;
  tripRequestsCount?: number;
}

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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
