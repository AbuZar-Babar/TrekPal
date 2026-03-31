/**
 * Shared TypeScript types
 */

export interface User {
  id: string;
  authUid: string;
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
  officeCity: string | null;
  jurisdiction: string | null;
  legalEntityType: 'SOLE_PROPRIETOR' | 'PARTNERSHIP' | 'COMPANY' | null;
  license: string | null;
  ntn: string | null;
  secpRegistrationNumber: string | null;
  partnershipRegistrationNumber: string | null;
  fieldOfOperations: string[];
  capitalAvailablePkr: number | null;
  status: string;
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

export interface TripSpecs {
  stayType: 'ANY' | 'HOTEL' | 'RESORT' | 'GUEST_HOUSE';
  roomCount: number;
  roomPreference: 'ANY' | 'SINGLE' | 'DOUBLE' | 'FAMILY';
  transportRequired: boolean;
  transportType: 'ANY' | 'CAR' | 'SUV' | 'VAN' | 'BUS';
  mealPlan: 'ANY' | 'BREAKFAST_ONLY' | 'HALF_BOARD' | 'FULL_BOARD';
  specialRequirements: string;
}

export interface OfferDetails {
  stayIncluded: boolean;
  stayDetails: string;
  transportIncluded: boolean;
  transportDetails: string;
  mealsIncluded: boolean;
  mealDetails: string;
  extras: string;
}

export interface BidRevision {
  id: string;
  bidId: string;
  actorRole: 'TRAVELER' | 'AGENCY';
  actorId: string;
  price: number;
  description: string | null;
  offerDetails: OfferDetails;
  createdAt: string;
}

export interface TripRequest {
  id: string;
  userId: string;
  userName?: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number | null;
  travelers: number;
  description: string | null;
  tripSpecs: TripSpecs;
  status: 'PENDING' | 'ACCEPTED' | 'CANCELLED';
  bidsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  tripRequestId: string;
  agencyId: string;
  agencyName: string;
  price: number;
  description: string | null;
  offerDetails: OfferDetails;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  awaitingActionBy: 'TRAVELER' | 'AGENCY' | 'NONE';
  revisionCount: number;
  createdAt: string;
  updatedAt: string;
  tripDestination?: string;
  tripStartDate?: string;
  tripEndDate?: string;
  revisions?: BidRevision[];
}

export interface Booking {
  id: string;
  userId: string;
  userName?: string;
  agencyId: string | null;
  agencyName?: string;
  tripRequestId: string | null;
  bidId: string | null;
  hotelId: string | null;
  roomId: string | null;
  vehicleId: string | null;
  packageId: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  destination?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
