import { Response } from 'express';

import { prisma } from '../../config/database';
import { ROLES, TRAVELER_KYC_STATUS } from '../../config/constants';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendError, sendSuccess } from '../../utils/response.util';
import {
  agencyBidFiltersSchema,
  counterOfferSchema,
  createBidSchema,
} from './bids.types';
import { bidsService } from './bids.service';

type BidActor =
  | { role: typeof ROLES.TRAVELER; travelerId: string }
  | { role: typeof ROLES.AGENCY; agencyId: string }
  | { role: typeof ROLES.ADMIN };

const ROOM_UNAVAILABLE_ERROR_CODE = 'ROOM_UNAVAILABLE';

function resolveStatusCode(error: Error): number {
  if (error.message === 'Unauthorized') {
    return 401;
  }

  if (error.message.includes('Unauthorized')) {
    return 403;
  }

  if (error.message.includes('not found')) {
    return 404;
  }

  return 400;
}

function isRoomAvailabilityError(error: Error): boolean {
  const message = error.message?.toLowerCase?.() ?? '';
  return (
    message.includes('no longer available') ||
    message.includes('availability changed')
  );
}

/**
 * Bids Controller
 * Handles HTTP requests for bids
 */
export class BidsController {
  private async ensureTravelerKycVerified(travelerId: string): Promise<void> {
    const traveler = await prisma.user.findUnique({
      where: { id: travelerId },
      select: { travelerKycStatus: true },
    });

    if (!traveler) {
      throw new Error('User profile not found');
    }

    if (traveler.travelerKycStatus !== TRAVELER_KYC_STATUS.VERIFIED) {
      throw new Error(
        'Complete traveler KYC before negotiating offers or accepting a booking',
      );
    }
  }

  private async getActor(req: AuthRequest): Promise<BidActor> {
    if (!req.user) {
      throw new Error('Unauthorized');
    }

    if (req.user.role === ROLES.TRAVELER) {
      const user = await prisma.user.findUnique({
        where: { authUid: req.user.uid },
        select: { id: true },
      });

      if (!user) {
        throw new Error('User profile not found');
      }

      return { role: ROLES.TRAVELER, travelerId: user.id };
    }

    if (req.user.role === ROLES.AGENCY) {
      const agency = await prisma.agency.findUnique({
        where: { authUid: req.user.uid },
        select: { id: true, status: true },
      });

      if (!agency) {
        throw new Error('Agency not found');
      }

      return { role: ROLES.AGENCY, agencyId: agency.id };
    }

    return { role: ROLES.ADMIN };
  }

  /**
   * Create a bid on a trip request
   * POST /api/bids
   */
  async createBid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      if (actor.role !== ROLES.AGENCY) {
        sendError(res, 'Only approved agencies can submit bids', 403);
        return;
      }

      const agency = await prisma.agency.findUnique({
        where: { id: actor.agencyId },
        select: { status: true },
      });

      if (!agency) {
        sendError(res, 'Agency not found', 404);
        return;
      }

      if (agency.status !== 'APPROVED') {
        sendError(res, 'Agency must be approved to submit bids', 403);
        return;
      }

      const input = createBidSchema.parse(req.body);
      const result = await bidsService.createBid(actor.agencyId, input);
      sendSuccess(res, result, 'Bid submitted successfully', 201);
    } catch (error: any) {
      if (isRoomAvailabilityError(error)) {
        sendError(res, error.message, 409, [
          { code: ROOM_UNAVAILABLE_ERROR_CODE, message: error.message },
        ]);
        return;
      }
      sendError(res, error.message || 'Failed to create bid', resolveStatusCode(error));
    }
  }

  /**
   * Get bids
   * GET /api/bids
   * Agencies see their own bids; admins see all.
   */
  async getBids(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const filters = agencyBidFiltersSchema.parse({
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
      });

      if (actor.role !== ROLES.AGENCY) {
        sendError(res, 'Use a specific bid thread endpoint for this role', 400);
        return;
      }

      const result = await bidsService.getAgencyBids(actor.agencyId, filters);
      sendSuccess(res, result, 'Bids retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get bids', resolveStatusCode(error));
    }
  }

  /**
   * Get bids for a specific trip request
   * GET /api/bids/trip-request/:tripRequestId
   */
  async getBidsForTripRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const { tripRequestId } = req.params;
      const bids = await bidsService.getBidsForTripRequest(tripRequestId, actor);
      sendSuccess(res, bids, 'Bids retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get bids', resolveStatusCode(error));
    }
  }

  /**
   * Get a single bid negotiation thread
   * GET /api/bids/:id
   */
  async getBidById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const result = await bidsService.getBidById(req.params.id, actor);
      sendSuccess(res, result, 'Bid thread retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get bid thread', resolveStatusCode(error));
    }
  }

  /**
   * Submit a counteroffer on an existing bid thread
   * POST /api/bids/:id/counteroffer
   */
  async createCounterOffer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      if (actor.role === ROLES.TRAVELER) {
        await this.ensureTravelerKycVerified(actor.travelerId);
      }
      const input = counterOfferSchema.parse(req.body);
      const result = await bidsService.createCounterOffer(req.params.id, actor, input);
      sendSuccess(res, result, 'Counteroffer submitted successfully');
    } catch (error: any) {
      if (isRoomAvailabilityError(error)) {
        sendError(res, error.message, 409, [
          { code: ROOM_UNAVAILABLE_ERROR_CODE, message: error.message },
        ]);
        return;
      }
      sendError(res, error.message || 'Failed to create counteroffer', resolveStatusCode(error));
    }
  }

  /**
   * Accept a bid (traveler only, creates booking transactionally)
   * POST /api/bids/:id/accept
   */
  async acceptBid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      if (actor.role !== ROLES.TRAVELER) {
        sendError(res, 'Only travelers can accept bids', 403);
        return;
      }

      await this.ensureTravelerKycVerified(actor.travelerId);

      const { id } = req.params;
      const result = await bidsService.acceptBid(id, actor.travelerId);
      sendSuccess(res, result, 'Bid accepted and booking created successfully');
    } catch (error: any) {
      if (isRoomAvailabilityError(error)) {
        sendError(res, error.message, 409, [
          { code: ROOM_UNAVAILABLE_ERROR_CODE, message: error.message },
        ]);
        return;
      }
      sendError(res, error.message || 'Failed to accept bid', resolveStatusCode(error));
    }
  }
}

export const bidsController = new BidsController();
