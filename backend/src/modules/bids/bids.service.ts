import { prisma } from '../../config/database';
import { BID_AWAITING_ACTION, BID_STATUS, BOOKING_STATUS, ROLES } from '../../config/constants';
import { emitTravelerBidUpdated, emitTravelerBookingUpdated } from '../../ws/socket.emitter';
import {
  AgencyBidFiltersInput,
  BidActorRole,
  BidResponse,
  BidRevisionResponse,
  CounterOfferInput,
  CreateBidInput,
  normalizeAwaitingAction,
  normalizeOfferDetails,
  offerDetailsToJson,
} from './bids.types';

type BidActor =
  | { role: typeof ROLES.TRAVELER; travelerId: string }
  | { role: typeof ROLES.AGENCY; agencyId: string }
  | { role: typeof ROLES.ADMIN };

const bidSummaryInclude = {
  agency: { select: { name: true } },
  tripRequest: {
    select: {
      destination: true,
      startDate: true,
      endDate: true,
      userId: true,
      status: true,
    },
  },
  _count: { select: { revisions: true } },
};

const bidDetailInclude = {
  ...bidSummaryInclude,
  revisions: {
    orderBy: { createdAt: 'asc' as const },
  },
};

function mapBidRevision(revision: any): BidRevisionResponse {
  return {
    id: revision.id,
    bidId: revision.bidId,
    actorRole: revision.actorRole === ROLES.AGENCY ? ROLES.AGENCY : ROLES.TRAVELER,
    actorId: revision.actorId,
    price: revision.price,
    description: revision.description,
    offerDetails: normalizeOfferDetails(revision.offerDetails),
    createdAt: revision.createdAt,
  };
}

function mapBid(bid: any): BidResponse {
  return {
    id: bid.id,
    tripRequestId: bid.tripRequestId,
    agencyId: bid.agencyId,
    agencyName: bid.agency.name,
    price: bid.price,
    description: bid.description,
    offerDetails: normalizeOfferDetails(bid.offerDetails),
    status: bid.status,
    awaitingActionBy: normalizeAwaitingAction(bid.awaitingActionBy),
    revisionCount: bid._count?.revisions ?? bid.revisions?.length ?? 0,
    createdAt: bid.createdAt,
    updatedAt: bid.updatedAt,
    tripDestination: bid.tripRequest?.destination,
    tripStartDate: bid.tripRequest?.startDate,
    tripEndDate: bid.tripRequest?.endDate,
    revisions: Array.isArray(bid.revisions)
      ? bid.revisions.map(mapBidRevision)
      : undefined,
  };
}

function getCounterOfferState(actorRole: BidActorRole): {
  requiredAwaitingAction: string;
  nextAwaitingAction: string;
} {
  if (actorRole === ROLES.TRAVELER) {
    return {
      requiredAwaitingAction: BID_AWAITING_ACTION.TRAVELER,
      nextAwaitingAction: BID_AWAITING_ACTION.AGENCY,
    };
  }

  return {
    requiredAwaitingAction: BID_AWAITING_ACTION.AGENCY,
    nextAwaitingAction: BID_AWAITING_ACTION.TRAVELER,
  };
}

/**
 * Bids Service
 * Handles bid business logic including revisions and transactional acceptance
 */
export class BidsService {
  /**
   * Create a bid on a trip request (agency only)
   */
  async createBid(agencyId: string, input: CreateBidInput): Promise<BidResponse> {
    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id: input.tripRequestId },
    });

    if (!tripRequest) {
      throw new Error('Trip request not found');
    }

    if (tripRequest.status !== 'PENDING') {
      throw new Error('Trip request is no longer accepting bids');
    }

    const existingBid = await prisma.bid.findFirst({
      where: {
        tripRequestId: input.tripRequestId,
        agencyId,
      },
    });

    if (existingBid) {
      throw new Error('You have already submitted a bid for this trip request');
    }

    const bid = await prisma.$transaction(async (tx: any) => {
      const createdBid = await tx.bid.create({
        data: {
          tripRequestId: input.tripRequestId,
          agencyId,
          price: input.price,
          description: input.description ?? null,
          offerDetails: offerDetailsToJson(input.offerDetails),
          awaitingActionBy: BID_AWAITING_ACTION.TRAVELER,
          status: BID_STATUS.PENDING,
        },
      });

      await tx.bidRevision.create({
        data: {
          bidId: createdBid.id,
          actorRole: ROLES.AGENCY,
          actorId: agencyId,
          price: input.price,
          description: input.description ?? null,
          offerDetails: offerDetailsToJson(input.offerDetails),
        },
      });

      return tx.bid.findUnique({
        where: { id: createdBid.id },
        include: bidSummaryInclude,
      });
    });

    if (!bid) {
      throw new Error('Failed to create bid');
    }

    emitTravelerBidUpdated(tripRequest.userId, {
      eventType: 'CREATED',
      tripRequestId: bid.tripRequestId,
      bidId: bid.id,
      agencyId: bid.agencyId,
      agencyName: bid.agency.name,
      status: bid.status,
      awaitingActionBy: normalizeAwaitingAction(bid.awaitingActionBy),
      updatedAt: bid.updatedAt.toISOString(),
    });

    return mapBid(bid);
  }

  /**
   * Get bids for a specific trip request
   */
  async getBidsForTripRequest(
    tripRequestId: string,
    actor: BidActor,
  ): Promise<BidResponse[]> {
    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id: tripRequestId },
      select: { userId: true },
    });

    if (!tripRequest) {
      throw new Error('Trip request not found');
    }

    const where: { tripRequestId: string; agencyId?: string } = { tripRequestId };

    if (actor.role === ROLES.TRAVELER) {
      if (tripRequest.userId !== actor.travelerId) {
        throw new Error('Unauthorized: not your trip request');
      }
    } else if (actor.role === ROLES.AGENCY) {
      where.agencyId = actor.agencyId;
    }

    const bids = await prisma.bid.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: bidSummaryInclude,
    });

    return bids.map(mapBid);
  }

  /**
   * Get a single bid thread by ID
   */
  async getBidById(id: string, actor: BidActor): Promise<BidResponse> {
    const bid = await prisma.bid.findUnique({
      where: { id },
      include: bidDetailInclude,
    });

    if (!bid) {
      throw new Error('Bid not found');
    }

    if (actor.role === ROLES.TRAVELER && bid.tripRequest.userId !== actor.travelerId) {
      throw new Error('Unauthorized: not your trip request');
    }

    if (actor.role === ROLES.AGENCY && bid.agencyId !== actor.agencyId) {
      throw new Error('Unauthorized: bid does not belong to your agency');
    }

    return mapBid(bid);
  }

  /**
   * Get all bids submitted by an agency
   */
  async getAgencyBids(
    agencyId: string,
    filters: AgencyBidFiltersInput,
  ): Promise<{ bids: BidResponse[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: { agencyId: string; status?: string } = { agencyId };
    if (status) {
      where.status = status;
    }

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: bidSummaryInclude,
      }),
      prisma.bid.count({ where }),
    ]);

    return {
      bids: bids.map(mapBid),
      total,
      page,
      limit,
    };
  }

  /**
   * Submit a structured counteroffer on an existing bid thread
   */
  async createCounterOffer(
    bidId: string,
    actor: BidActor,
    input: CounterOfferInput,
  ): Promise<BidResponse> {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        tripRequest: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    });

    if (!bid) {
      throw new Error('Bid not found');
    }

    if (bid.status !== BID_STATUS.PENDING) {
      throw new Error('Only pending bid threads can be revised');
    }

    if (bid.tripRequest.status !== 'PENDING') {
      throw new Error('Trip request is no longer accepting negotiation');
    }

    let actorId: string;
    let actorRole: BidActorRole;

    if (actor.role === ROLES.TRAVELER) {
      if (bid.tripRequest.userId !== actor.travelerId) {
        throw new Error('Unauthorized: not your trip request');
      }

      actorId = actor.travelerId;
      actorRole = ROLES.TRAVELER;
    } else if (actor.role === ROLES.AGENCY) {
      if (bid.agencyId !== actor.agencyId) {
        throw new Error('Unauthorized: bid does not belong to your agency');
      }

      actorId = actor.agencyId;
      actorRole = ROLES.AGENCY;
    } else {
      throw new Error('Admins cannot create counteroffers');
    }

    const negotiationState = getCounterOfferState(actorRole);
    if (bid.awaitingActionBy !== negotiationState.requiredAwaitingAction) {
      throw new Error('It is not your turn to counteroffer on this bid thread');
    }

    const updatedBid = await prisma.$transaction(async (tx: any) => {
      await tx.bidRevision.create({
        data: {
          bidId,
          actorRole,
          actorId,
          price: input.price,
          description: input.description ?? null,
          offerDetails: offerDetailsToJson(input.offerDetails),
        },
      });

      return tx.bid.update({
        where: { id: bidId },
        data: {
          price: input.price,
          description: input.description ?? null,
          offerDetails: offerDetailsToJson(input.offerDetails),
          awaitingActionBy: negotiationState.nextAwaitingAction,
        },
        include: bidDetailInclude,
      });
    });

    if (actor.role === ROLES.AGENCY) {
      emitTravelerBidUpdated(bid.tripRequest.userId, {
        eventType: 'COUNTEROFFERED',
        tripRequestId: updatedBid.tripRequestId,
        bidId: updatedBid.id,
        agencyId: updatedBid.agencyId,
        agencyName: updatedBid.agency.name,
        status: updatedBid.status,
        awaitingActionBy: normalizeAwaitingAction(updatedBid.awaitingActionBy),
        updatedAt: updatedBid.updatedAt.toISOString(),
      });
    }

    return mapBid(updatedBid);
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
  async acceptBid(
    bidId: string,
    userId: string,
  ): Promise<{ bidId: string; bookingId: string; bookingUpdatedAt: Date }> {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        agency: {
          select: {
            name: true,
          },
        },
        tripRequest: true,
      },
    });

    if (!bid) {
      throw new Error('Bid not found');
    }

    if (bid.status !== BID_STATUS.PENDING) {
      throw new Error('Bid is no longer pending');
    }

    if (bid.tripRequest.userId !== userId) {
      throw new Error('Unauthorized: not your trip request');
    }

    if (bid.tripRequest.status !== 'PENDING') {
      throw new Error('Trip request is no longer accepting bids');
    }

    if (bid.awaitingActionBy === BID_AWAITING_ACTION.AGENCY) {
      throw new Error('Cannot accept a bid while the agency is still reviewing your counteroffer');
    }

    const result = await prisma.$transaction(async (tx: any) => {
      await tx.bid.update({
        where: { id: bidId },
        data: {
          status: BID_STATUS.ACCEPTED,
          awaitingActionBy: BID_AWAITING_ACTION.NONE,
        },
      });

      await tx.bid.updateMany({
        where: {
          tripRequestId: bid.tripRequestId,
          id: { not: bidId },
        },
        data: {
          status: BID_STATUS.REJECTED,
          awaitingActionBy: BID_AWAITING_ACTION.NONE,
        },
      });

      await tx.tripRequest.update({
        where: { id: bid.tripRequestId },
        data: { status: 'ACCEPTED' },
      });

      const booking = await tx.booking.create({
        data: {
          userId,
          agencyId: bid.agencyId,
          tripRequestId: bid.tripRequestId,
          bidId: bid.id,
          hotelId: bid.tripRequest.hotelId,
          roomId: bid.tripRequest.roomId,
          vehicleId: bid.tripRequest.vehicleId,
          // Traveler-accepted custom trip bids are final and should appear
          // in Trips immediately, unlike package offer requests.
          status: BOOKING_STATUS.CONFIRMED,
          totalAmount: bid.price,
          startDate: bid.tripRequest.startDate,
          endDate: bid.tripRequest.endDate,
        },
      });

      return { bidId: bid.id, bookingId: booking.id, bookingUpdatedAt: booking.updatedAt };
    });

    emitTravelerBidUpdated(userId, {
      eventType: 'ACCEPTED',
      tripRequestId: bid.tripRequestId,
      bidId: bid.id,
      agencyId: bid.agencyId,
      agencyName: bid.agency.name,
      status: BID_STATUS.ACCEPTED,
      awaitingActionBy: BID_AWAITING_ACTION.NONE,
      updatedAt: new Date().toISOString(),
    });

    emitTravelerBookingUpdated(userId, {
      eventType: 'CREATED',
      bookingId: result.bookingId,
      userId,
      agencyId: bid.agencyId,
      agencyName: bid.agency.name,
      tripRequestId: bid.tripRequestId,
      packageId: null,
      status: BOOKING_STATUS.CONFIRMED,
      updatedAt: result.bookingUpdatedAt.toISOString(),
    });

    return result;
  }
}

export const bidsService = new BidsService();
