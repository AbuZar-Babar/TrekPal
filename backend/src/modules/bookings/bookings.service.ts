import { prisma } from '../../config/database';
import { BOOKING_STATUS } from '../../config/constants';
import { BookingParticipantPreview, BookingResponse } from './bookings.types';

const bookingInclude = {
  user: { select: { name: true } },
  agency: { select: { name: true } },
  tripRequest: { select: { destination: true } },
  package: {
    select: {
      name: true,
      bookings: {
        where: {
          status: {
            not: BOOKING_STATUS.CANCELLED,
          },
        },
        orderBy: {
          createdAt: 'asc' as const,
        },
        select: {
          userId: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
};

function buildInitials(name?: string | null): string {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) {
    return 'TP';
  }

  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('');
}

function mapParticipant(booking: any): BookingParticipantPreview {
  return {
    userId: booking.userId,
    travelerName: booking.user?.name?.trim() || 'Traveler',
    initials: buildInitials(booking.user?.name),
    bookingStatus: booking.status,
    joinedAt: booking.createdAt,
  };
}

function mapBooking(booking: any): BookingResponse {
  return {
    id: booking.id,
    userId: booking.userId,
    userName: booking.user?.name ?? undefined,
    agencyId: booking.agencyId,
    agencyName: booking.agency?.name ?? undefined,
    tripRequestId: booking.tripRequestId,
    bidId: booking.bidId,
    hotelId: booking.hotelId,
    roomId: booking.roomId,
    vehicleId: booking.vehicleId,
    packageId: booking.packageId,
    status: booking.status,
    totalAmount: booking.totalAmount,
    startDate: booking.startDate,
    endDate: booking.endDate,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    destination: booking.tripRequest?.destination ?? booking.package?.name ?? undefined,
    packageTravelerCount: booking.package?.bookings?.length,
    packageParticipants: booking.package?.bookings?.map(mapParticipant),
  };
}

/**
 * Bookings Service
 * Handles booking business logic
 */
export class BookingsService {
  /**
   * Get bookings for a traveler
   */
  async getUserBookings(
    userId: string,
    filters: { status?: string; page?: number; limit?: number }
  ): Promise<{ bookings: BookingResponse[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: bookingInclude,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings: bookings.map(mapBooking),
      total,
      page,
      limit,
    };
  }

  /**
   * Get bookings for an agency
   */
  async getAgencyBookings(
    agencyId: string,
    filters: { status?: string; page?: number; limit?: number }
  ): Promise<{ bookings: BookingResponse[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { agencyId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: bookingInclude,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings: bookings.map(mapBooking),
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string): Promise<BookingResponse> {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });

    if (!booking) throw new Error('Booking not found');

    return mapBooking(booking);
  }

  /**
   * Update booking status (agency or admin)
   */
  async updateBookingStatus(
    id: string,
    status: string,
    actorAgencyId?: string
  ): Promise<BookingResponse> {
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) throw new Error('Booking not found');

    // If the actor is an agency, verify they own the booking
    if (actorAgencyId && booking.agencyId !== actorAgencyId) {
      throw new Error('Unauthorized: booking does not belong to your agency');
    }

    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[booking.status];
    if (!allowed || !allowed.includes(status)) {
      throw new Error(`Cannot transition booking from ${booking.status} to ${status}`);
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: bookingInclude,
    });

    return mapBooking(updated);
  }
}

export const bookingsService = new BookingsService();
