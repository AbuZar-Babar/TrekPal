/**
 * Booking Types
 */

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
}

export interface UpdateBookingStatusInput {
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}
