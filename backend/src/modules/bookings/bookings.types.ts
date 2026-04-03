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

export interface UpdateBookingStatusInput {
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}
