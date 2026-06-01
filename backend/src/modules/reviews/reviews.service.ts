import { prisma } from '../../config/database';

export interface CreateReviewInput {
  bookingId: string;
  rating: number; // 1–5
  comment?: string;
}

export interface ReviewResponse {
  id: string;
  userId: string;
  bookingId: string;
  hotelId: string | null;
  rating: number;
  comment: string | null;
  userName: string | null;
  destination: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapReview(review: any): ReviewResponse {
  return {
    id: review.id,
    userId: review.userId,
    bookingId: review.bookingId,
    hotelId: review.hotelId ?? null,
    rating: review.rating,
    comment: review.comment ?? null,
    userName: review.user?.name ?? null,
    destination: review.booking?.tripRequest?.destination ?? null,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

export class ReviewsService {
  /**
   * Create a review for a completed booking (traveler only, one per booking).
   */
  async createReview(userId: string, input: CreateReviewInput): Promise<ReviewResponse> {
    if (input.rating < 1 || input.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: {
        tripRequest: { select: { destination: true } },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized: this booking does not belong to you');
    }

    if (booking.status !== 'COMPLETED') {
      throw new Error('Reviews can only be left for completed bookings');
    }

    const existing = await prisma.review.findUnique({
      where: { bookingId: input.bookingId },
    });

    if (existing) {
      throw new Error('You have already reviewed this booking');
    }

    const review = await prisma.$transaction(async (tx: any) => {
      const created = await tx.review.create({
        data: {
          userId,
          bookingId: input.bookingId,
          hotelId: booking.hotelId ?? null,
          rating: input.rating,
          comment: input.comment?.trim() || null,
        },
        include: {
          user: { select: { name: true } },
          booking: {
            include: { tripRequest: { select: { destination: true } } },
          },
        },
      });

      // Update hotel average rating if booking had a hotel
      if (booking.hotelId) {
        const agg = await tx.review.aggregate({
          where: { hotelId: booking.hotelId },
          _avg: { rating: true },
        });

        const newAvg = agg._avg.rating ?? input.rating;

        await tx.hotel.update({
          where: { id: booking.hotelId },
          data: { rating: Math.round(newAvg * 10) / 10 },
        });
      }

      return created;
    });

    return mapReview(review);
  }

  /**
   * Get the review for a specific booking (traveler).
   */
  async getReviewForBooking(bookingId: string, userId: string): Promise<ReviewResponse | null> {
    const review = await prisma.review.findUnique({
      where: { bookingId },
      include: {
        user: { select: { name: true } },
        booking: {
          include: { tripRequest: { select: { destination: true } } },
        },
      },
    });

    if (!review) return null;

    if (review.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return mapReview(review);
  }

  /**
   * Get all reviews for bookings belonging to this agency.
   */
  async getAgencyReviews(
    agencyId: string,
    params: { page: number; limit: number },
  ): Promise<{ reviews: ReviewResponse[]; total: number; page: number; limit: number }> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const where = {
      booking: {
        agencyId,
      },
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' as const },
        include: {
          user: { select: { name: true } },
          booking: {
            include: { tripRequest: { select: { destination: true } } },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews: reviews.map(mapReview),
      total,
      page,
      limit,
    };
  }

  /**
   * Get reviews for a specific hotel (public).
   */
  async getHotelReviews(
    hotelId: string,
    params: { page: number; limit: number },
  ): Promise<{ reviews: ReviewResponse[]; total: number; avgRating: number }> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const where = { hotelId };

    const [reviews, total, agg] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' as const },
        include: {
          user: { select: { name: true } },
          booking: {
            include: { tripRequest: { select: { destination: true } } },
          },
        },
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({ where, _avg: { rating: true } }),
    ]);

    return {
      reviews: reviews.map(mapReview),
      total,
      avgRating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
    };
  }
}

export const reviewsService = new ReviewsService();
