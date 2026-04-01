import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { tripRequestsService } from './tripRequests.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { prisma } from '../../config/database';
import { ROLES, TRAVELER_KYC_STATUS } from '../../config/constants';
import {
  createTripRequestSchema,
  tripRequestFiltersSchema,
  updateTripRequestSchema,
} from './tripRequests.types';

/**
 * Trip Requests Controller
 * Handles HTTP requests for trip requests
 */
export class TripRequestsController {
  /**
   * Create a trip request
   * POST /api/trip-requests
   */
  async createTripRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      // Look up the traveler's profile
      const user = await prisma.user.findUnique({
        where: { authUid: req.user.uid },
      });

      if (!user) {
        sendError(res, 'User profile not found. Please complete registration first.', 404);
        return;
      }

      if (user.travelerKycStatus !== TRAVELER_KYC_STATUS.VERIFIED) {
        sendError(
          res,
          'Complete traveler KYC before publishing a trip brief',
          403,
        );
        return;
      }

      const input = createTripRequestSchema.parse(req.body);
      const result = await tripRequestsService.createTripRequest(user.id, input);
      sendSuccess(res, result, 'Trip request created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create trip request', 400);
    }
  }

  /**
   * Get trip requests
   * GET /api/trip-requests
   *
   * Travelers see their own; agencies see PENDING ones; admins see all.
   */
  async getTripRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const filters = tripRequestFiltersSchema.parse({
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
        search: req.query.search,
      }) as Record<string, unknown>;

      if (req.user.role === ROLES.TRAVELER) {
        // Travelers see only their own
        const user = await prisma.user.findUnique({
          where: { authUid: req.user.uid },
        });
        if (!user) {
          sendError(res, 'User profile not found', 404);
          return;
        }
        filters.userId = user.id;
      } else if (req.user.role === ROLES.AGENCY) {
        // Agencies see only PENDING trip requests (ones they can bid on)
        if (!filters.status) {
          filters.status = 'PENDING';
        }
      }
      // Admins see all (no additional filter)

      const result = await tripRequestsService.getTripRequests(
        filters as Parameters<typeof tripRequestsService.getTripRequests>[0],
      );
      sendSuccess(res, result, 'Trip requests retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get trip requests', 500);
    }
  }

  /**
   * Get trip request by ID
   * GET /api/trip-requests/:id
   */
  async getTripRequestById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { id } = req.params;
      const result = await tripRequestsService.getTripRequestById(id);
      sendSuccess(res, result, 'Trip request retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Trip request not found', 404);
    }
  }

  /**
   * Update a trip request
   * PUT /api/trip-requests/:id
   */
  async updateTripRequest(req: AuthRequest, res: Response): Promise<void> {
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
      const input = updateTripRequestSchema.parse(req.body);
      const result = await tripRequestsService.updateTripRequest(id, user.id, input);
      sendSuccess(res, result, 'Trip request updated successfully');
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        sendError(res, error.message, 403);
      } else {
        sendError(res, error.message || 'Failed to update trip request', 400);
      }
    }
  }

  /**
   * Cancel a trip request
   * DELETE /api/trip-requests/:id
   */
  async cancelTripRequest(req: AuthRequest, res: Response): Promise<void> {
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
      await tripRequestsService.cancelTripRequest(id, user.id);
      sendSuccess(res, null, 'Trip request cancelled successfully');
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        sendError(res, error.message, 403);
      } else {
        sendError(res, error.message || 'Failed to cancel trip request', 400);
      }
    }
  }
}

export const tripRequestsController = new TripRequestsController();
