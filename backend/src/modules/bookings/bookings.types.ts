/**
 * Booking Types
 */

export interface BookingParticipantPreview {
  userId: string;
  travelerName: string;
  initials: string;
  age: number | null;
  gender: string | null;
  avatar: string | null;
  bookingStatus: string;
  joinedAt: Date;
}

export interface BookingResponse {
  id: string;
  userId: string;
  userName?: string;
  agencyId: string | null;
  agencyName?: string;
  agencyPhone: string | null;
  tripRequestId: string | null;
  bidId: string | null;
  hotelId: string | null;
  roomId: string | null;
  vehicleId: string | null;
  packageId: string | null;
  status: string;
  totalAmount: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  // Trip summary
  destination?: string;
  packageTravelerCount?: number;
  packageParticipants?: BookingParticipantPreview[];
}

export interface HotelBookingResponse {
  id: string;
  source: 'DIRECT_BOOKING' | 'PACKAGE_RESERVATION';
  bookingId: string | null;
  packageId: string | null;
  packageName: string | null;
  agencyId: string | null;
  agencyName: string | null;
  travelerName: string | null;
  roomId: string;
  roomType: string;
  reservedRooms: number;
  status: string;
  totalAmount: number | null;
  startDate: Date;
  endDate: Date;
  stayLengthDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateBookingStatusInput {
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}
