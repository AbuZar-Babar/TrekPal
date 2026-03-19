import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { bidsService } from './bids.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { prisma } from '../../config/database';
import { ROLES } from '../../config/constants';

/**
 * Bids Controller
 * Handles HTTP requests for bids
 */
export class BidsController {
  /**
   * Create a bid on a trip request
   * POST /api/bids
   */
  async createBid(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      // Get agency from auth UID
      const agency = await prisma.agency.findUnique({
        where: { authUid: req.user.uid },
      });

      if (!agency) {
        sendError(res, 'Agency not found', 404);
        return;
      }

      if (agency.status !== 'APPROVED') {
        sendError(res, 'Agency must be approved to submit bids', 403);
        return;
      }

      const result = await bidsService.createBid(agency.id, req.body);
      sendSuccess(res, result, 'Bid submitted successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create bid', 400);
    }
  }

  /**
   * Get bids
   * GET /api/bids
   * Agencies see their own bids; admins see all.
   */
  async getBids(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      if (req.user.role === ROLES.AGENCY) {
        const agency = await prisma.agency.findUnique({
          where: { authUid: req.user.uid },
        });

        if (!agency) {
          sendError(res, 'Agency not found', 404);
          return;
        }

        const result = await bidsService.getAgencyBids(agency.id, { status, page, limit });
        sendSuccess(res, result, 'Bids retrieved successfully');
      } else {
        // Admins or other roles — not currently needed but safe fallback
        sendError(res, 'Use GET /api/bids/trip-request/:tripRequestId to view bids', 400);
      }
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get bids', 500);
    }
  }

  /**
   * Get bids for a specific trip request
   * GET /api/bids/trip-request/:tripRequestId
   */
  async getBidsForTripRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { tripRequestId } = req.params;
      const bids = await bidsService.getBidsForTripRequest(tripRequestId);
      sendSuccess(res, bids, 'Bids retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get bids', 500);
    }
  }

  /**
   * Accept a bid (traveler only, creates booking transactionally)
   * POST /api/bids/:id/accept
   */
  async acceptBid(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { authUid: req.user.uid },
      });

      if (!user) {
        sendError(res, 'User profile not found', 404);
        return;
      }

      const { id } = req.params;
      const result = await bidsService.acceptBid(id, user.id);
      sendSuccess(res, result, 'Bid accepted and booking created successfully');
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        sendError(res, error.message, 403);
      } else {
        sendError(res, error.message || 'Failed to accept bid', 400);
      }
    }
  }
}

export const bidsController = new BidsController();
