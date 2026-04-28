import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { bookingsService } from './bookings.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { prisma } from '../../config/database';
import { ROLES } from '../../config/constants';

/**
 * Bookings Controller
 * Handles HTTP requests for bookings
 */
export class BookingsController {
  /**
   * Get bookings (role-scoped)
   * GET /api/bookings
   */
  async getBookings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      if (req.user.role === ROLES.TRAVELER) {
        const user = await prisma.user.findUnique({
          where: { authUid: req.user.uid },
        });
        if (!user) {
          sendError(res, 'User profile not found', 404);
          return;
        }
        const result = await bookingsService.getUserBookings(user.id, { status, page, limit });
        sendSuccess(res, result, 'Bookings retrieved successfully');
      } else if (req.user.role === ROLES.AGENCY) {
        const agency = await prisma.agency.findUnique({
          where: { authUid: req.user.uid },
        });
        if (!agency) {
          sendError(res, 'Agency not found', 404);
          return;
        }
        const result = await bookingsService.getAgencyBookings(agency.id, { status, page, limit });
        sendSuccess(res, result, 'Bookings retrieved successfully');
      } else {
        // Admin — could list all, for now return error
        sendError(res, 'Admin booking listing not yet implemented', 501);
      }
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get bookings', 500);
    }
  }

  /**
   * Get booking by ID
   * GET /api/bookings/:id
   */
  async getBookingById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { id } = req.params;
      const result = await bookingsService.getBookingById(id);
      sendSuccess(res, result, 'Booking retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Booking not found', 404);
    }
  }

  /**
   * Update booking status
   * PUT /api/bookings/:id/status
   */
  async updateBookingStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        sendError(res, 'Status is required', 400);
        return;
      }

      let agencyId: string | undefined;
      if (req.user.role === ROLES.TRAVELER) {
        sendError(res, 'Travelers cannot update booking status', 403);
        return;
      }

      if (req.user.role === ROLES.AGENCY) {
        const agency = await prisma.agency.findUnique({
          where: { authUid: req.user.uid },
        });
        if (!agency) {
          sendError(res, 'Agency not found', 404);
          return;
        }
        agencyId = agency.id;
      }

      const result = await bookingsService.updateBookingStatus(id, status, agencyId);
      sendSuccess(res, result, 'Booking status updated successfully');
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        sendError(res, error.message, 403);
      } else if (error.code === 'ROOM_UNAVAILABLE' || error.code === 'OFFER_UNAVAILABLE') {
        sendError(res, error.message, 409, [{ code: error.code, message: error.message }]);
      } else {
        sendError(res, error.message || 'Failed to update booking status', 400);
      }
    }
  }

  /**
   * Cancel booking (traveler only)
   * POST /api/bookings/:id/cancel
   */
  async cancelBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      if (req.user.role !== ROLES.TRAVELER) {
        sendError(res, 'Only travelers can cancel bookings', 403);
        return;
      }

      const traveler = await prisma.user.findUnique({
        where: { authUid: req.user.uid },
        select: { id: true },
      });

      if (!traveler) {
        sendError(res, 'User profile not found', 404);
        return;
      }

      const { id } = req.params;
      const result = await bookingsService.cancelTravelerBooking(id, traveler.id);
      sendSuccess(res, result, 'Booking cancelled successfully');
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        sendError(res, error.message, 403);
      } else {
        sendError(res, error.message || 'Failed to cancel booking', 400);
      }
    }
  }
}

export const bookingsController = new BookingsController();
