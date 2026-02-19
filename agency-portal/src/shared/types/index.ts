/**
 * Shared TypeScript types
 */

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: 'TRAVELER' | 'AGENCY' | 'ADMIN';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Agency {
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
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  agencyId: string;
  type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  pricePerDay: number;
  images: string[];
  isAvailable: boolean;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface Hotel {
  id: string;
  agencyId: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  images: string[];
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
