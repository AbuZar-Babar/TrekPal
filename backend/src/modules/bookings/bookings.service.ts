import { prisma } from '../../config/database';
import { BOOKING_STATUS } from '../../config/constants';
import { createSignedKycUrl, isHttpUrl } from '../../services/kyc-storage.service';
import { emitTravelerBookingUpdated } from '../../ws/socket.emitter';
import { BookingParticipantPreview, BookingResponse } from './bookings.types';

const bookingInclude = {
  user: { select: { name: true } },
  agency: { select: { name: true, phone: true } },
  tripRequest: { select: { destination: true } },
  package: {
    select: {
      name: true,
      bookings: {
        where: {
          status: BOOKING_STATUS.CONFIRMED,
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
              dateOfBirth: true,
              gender: true,
              avatar: true,
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

function deriveAge(dateOfBirth?: Date | null): number | null {
  if (!dateOfBirth) {
    return null;
  }

  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const hasBirthdayPassed =
    now.getMonth() > dateOfBirth.getMonth() ||
    (now.getMonth() === dateOfBirth.getMonth() &&
      now.getDate() >= dateOfBirth.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

async function resolveAvatarUrl(value?: string | null): Promise<string | null> {
  if (!value) {
    return null;
  }

  if (isHttpUrl(value)) {
    return value;
  }

  try {
    return await createSignedKycUrl(value);
  } catch {
    return null;
  }
}

async function mapParticipant(booking: any): Promise<BookingParticipantPreview> {
  return {
    userId: booking.userId,
    travelerName: booking.user?.name?.trim() || 'Traveler',
    initials: buildInitials(booking.user?.name),
    age: deriveAge(booking.user?.dateOfBirth),
    gender: booking.user?.gender ?? null,
    avatar: await resolveAvatarUrl(booking.user?.avatar),
    bookingStatus: booking.status,
    joinedAt: booking.createdAt,
  };
}

async function mapBooking(booking: any): Promise<BookingResponse> {
  return {
    id: booking.id,
    userId: booking.userId,
    userName: booking.user?.name ?? undefined,
    agencyId: booking.agencyId,
    agencyName: booking.agency?.name ?? undefined,
    agencyPhone: booking.agency?.phone ?? null,
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
    packageParticipants: booking.package?.bookings
      ? await Promise.all(booking.package.bookings.map(mapParticipant))
      : undefined,
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
      bookings: await Promise.all(bookings.map(mapBooking)),
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
      bookings: await Promise.all(bookings.map(mapBooking)),
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

    emitTravelerBookingUpdated(updated.userId, {
      eventType: 'STATUS_CHANGED',
      bookingId: updated.id,
      userId: updated.userId,
      agencyId: updated.agencyId,
      agencyName: updated.agency?.name ?? null,
      packageId: updated.packageId ?? null,
      tripRequestId: updated.tripRequestId ?? null,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    });

    return mapBooking(updated);
  }

  /**
   * Cancel a booking (traveler only)
   *
   * Travelers can opt out only if the trip starts in >= 3 days.
   */
  async cancelTravelerBooking(
    bookingId: string,
    travelerId: string,
  ): Promise<BookingResponse> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: bookingInclude,
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== travelerId) {
      throw new Error('Unauthorized: not your booking');
    }

    if (
      booking.status !== BOOKING_STATUS.PENDING &&
      booking.status !== BOOKING_STATUS.CONFIRMED
    ) {
      throw new Error('Only pending or confirmed bookings can be cancelled');
    }

    const now = Date.now();
    const start = new Date(booking.startDate).getTime();
    const msUntilStart = start - now;
    const minLeadMs = 3 * 24 * 60 * 60 * 1000;

    if (msUntilStart < minLeadMs) {
      throw new Error('Trips can only be cancelled 3 days before the start date');
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BOOKING_STATUS.CANCELLED },
      include: bookingInclude,
    });

    emitTravelerBookingUpdated(updated.userId, {
      eventType: 'STATUS_CHANGED',
      bookingId: updated.id,
      userId: updated.userId,
      agencyId: updated.agencyId,
      agencyName: updated.agency?.name ?? null,
      packageId: updated.packageId ?? null,
      tripRequestId: updated.tripRequestId ?? null,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    });

    return mapBooking(updated);
  }
}

export const bookingsService = new BookingsService();
