import { prisma } from '../../config/database';
import { BID_STATUS, BOOKING_STATUS } from '../../config/constants';
import { CreateBidInput, BidResponse } from './bids.types';

/**
 * Bids Service
 * Handles bid business logic including transactional bid acceptance
 */
export class BidsService {
  /**
   * Create a bid on a trip request (agency only)
   */
  async createBid(agencyId: string, input: CreateBidInput): Promise<BidResponse> {
    // Verify trip request exists and is PENDING
    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id: input.tripRequestId },
    });

    if (!tripRequest) {
      throw new Error('Trip request not found');
    }

    if (tripRequest.status !== 'PENDING') {
      throw new Error('Trip request is no longer accepting bids');
    }

    // Prevent duplicate bids from same agency
    const existingBid = await prisma.bid.findFirst({
      where: {
        tripRequestId: input.tripRequestId,
        agencyId,
      },
    });

    if (existingBid) {
      throw new Error('You have already submitted a bid for this trip request');
    }

    const bid = await prisma.bid.create({
      data: {
        tripRequestId: input.tripRequestId,
        agencyId,
        price: input.price,
        description: input.description ?? null,
        status: BID_STATUS.PENDING,
      },
      include: {
        agency: { select: { name: true } },
        tripRequest: { select: { destination: true, startDate: true, endDate: true } },
      },
    });

    return {
      id: bid.id,
      tripRequestId: bid.tripRequestId,
      agencyId: bid.agencyId,
      agencyName: bid.agency.name,
      price: bid.price,
      description: bid.description,
      status: bid.status,
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
      tripDestination: bid.tripRequest.destination,
      tripStartDate: bid.tripRequest.startDate,
      tripEndDate: bid.tripRequest.endDate,
    };
  }

  /**
   * Get bids for a specific trip request
   */
  async getBidsForTripRequest(tripRequestId: string): Promise<BidResponse[]> {
    const bids = await prisma.bid.findMany({
      where: { tripRequestId },
      orderBy: { createdAt: 'desc' },
      include: {
        agency: { select: { name: true } },
        tripRequest: { select: { destination: true, startDate: true, endDate: true } },
      },
    });

    return bids.map((bid) => ({
      id: bid.id,
      tripRequestId: bid.tripRequestId,
      agencyId: bid.agencyId,
      agencyName: bid.agency.name,
      price: bid.price,
      description: bid.description,
      status: bid.status,
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
      tripDestination: bid.tripRequest.destination,
      tripStartDate: bid.tripRequest.startDate,
      tripEndDate: bid.tripRequest.endDate,
    }));
  }

  /**
   * Get all bids submitted by an agency
   */
  async getAgencyBids(
    agencyId: string,
    filters: { status?: string; page?: number; limit?: number }
  ): Promise<{ bids: BidResponse[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { agencyId };
    if (status) where.status = status;

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agency: { select: { name: true } },
          tripRequest: { select: { destination: true, startDate: true, endDate: true } },
        },
      }),
      prisma.bid.count({ where }),
    ]);

    return {
      bids: bids.map((bid) => ({
        id: bid.id,
        tripRequestId: bid.tripRequestId,
        agencyId: bid.agencyId,
        agencyName: bid.agency.name,
        price: bid.price,
        description: bid.description,
        status: bid.status,
        createdAt: bid.createdAt,
        updatedAt: bid.updatedAt,
        tripDestination: bid.tripRequest.destination,
        tripStartDate: bid.tripRequest.startDate,
        tripEndDate: bid.tripRequest.endDate,
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * Accept a bid (traveler only)
   *
   * Uses a Prisma transaction to atomically:
   * 1. Set the accepted bid status to ACCEPTED
   * 2. Reject all other bids for the same trip request
   * 3. Update the trip request status to ACCEPTED
   * 4. Create a booking from the accepted bid
   */
  async acceptBid(bidId: string, userId: string): Promise<{ bidId: string; bookingId: string }> {
    // Verify the bid exists
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        tripRequest: true,
      },
    });

    if (!bid) throw new Error('Bid not found');
    if (bid.status !== BID_STATUS.PENDING) throw new Error('Bid is no longer pending');
    if (bid.tripRequest.userId !== userId) throw new Error('Unauthorized: not your trip request');
    if (bid.tripRequest.status !== 'PENDING') throw new Error('Trip request is no longer accepting bids');

    // Transactional bid acceptance
    const result = await prisma.$transaction(async (tx) => {
      // 1. Accept this bid
      await tx.bid.update({
        where: { id: bidId },
        data: { status: BID_STATUS.ACCEPTED },
      });

      // 2. Reject all other bids for this trip request
      await tx.bid.updateMany({
        where: {
          tripRequestId: bid.tripRequestId,
          id: { not: bidId },
        },
        data: { status: BID_STATUS.REJECTED },
      });

      // 3. Update trip request status
      await tx.tripRequest.update({
        where: { id: bid.tripRequestId },
        data: { status: 'ACCEPTED' },
      });

      // 4. Create booking
      const booking = await tx.booking.create({
        data: {
          userId,
          agencyId: bid.agencyId,
          tripRequestId: bid.tripRequestId,
          bidId: bid.id,
          status: BOOKING_STATUS.PENDING,
          totalAmount: bid.price,
          startDate: bid.tripRequest.startDate,
          endDate: bid.tripRequest.endDate,
        },
      });

      return { bidId: bid.id, bookingId: booking.id };
    });

    return result;
  }
}

export const bidsService = new BidsService();
