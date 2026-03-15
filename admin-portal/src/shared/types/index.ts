/**
 * Shared TypeScript types
 */

export interface User {
  id: string;
  authUid: string;
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
  officeCity: string | null;
  jurisdiction: string | null;
  legalEntityType: 'SOLE_PROPRIETOR' | 'PARTNERSHIP' | 'COMPANY' | null;
  license: string | null;
  ntn: string | null;
  secpRegistrationNumber: string | null;
  partnershipRegistrationNumber: string | null;
  fieldOfOperations: string[];
  capitalAvailablePkr: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
  applicationSubmittedAt: string | null;
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
