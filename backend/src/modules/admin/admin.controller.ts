import { Response } from 'express';
import { ZodError } from 'zod';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { adminService } from './admin.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import {
  updateAgencySchema,
  updateUserSchema,
  userPaginationSchema,
} from './admin.types';

/**
 * Admin Controller
 * Handles HTTP requests for admin operations
 */
export class AdminController {
  /**
   * Get all agencies
   * GET /api/admin/agencies
   * 
   * Query params:
   * - page: number (default: 1)
   * - limit: number (default: 20)
   * - status: PENDING | APPROVED | REJECTED
   * - search: string
   */
  async getAgencies(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      console.log('[Admin Controller] GET /admin/agencies - Request:', {
        page,
        limit,
        status,
        search,
        user: req.user?.email,
        role: req.user?.role,
      });

      const result = await adminService.getAgencies(page, limit, status, search);

      console.log('[Admin Controller] Result from service:', JSON.stringify(result, null, 2));

      console.log('[Admin Controller] Sending response:', {
        agenciesCount: result.agencies.length,
        total: result.total,
      });

      sendSuccess(res, result, 'Agencies retrieved successfully');
    } catch (error: any) {
      console.error('[Admin Controller] Error getting agencies:', error);
      sendError(res, error.message || 'Failed to get agencies', 500);
    }
  }

  /**
   * Approve an agency
   * POST /api/admin/agencies/:id/approve
   */
  async approveAgency(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      const agency = await adminService.approveAgency(id, reason);
      sendSuccess(res, agency, 'Agency approved successfully');
    } catch (error: any) {
      if (error.code === 'P2025') {
        sendError(res, 'Agency not found', 404);
      } else {
        sendError(res, error.message || 'Failed to approve agency', 500);
      }
    }
  }

  /**
   * Reject an agency
   * POST /api/admin/agencies/:id/reject
   */
  async rejectAgency(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      const agency = await adminService.rejectAgency(id, reason);
      sendSuccess(res, agency, 'Agency rejected successfully');
    } catch (error: any) {
      if (error.code === 'P2025') {
        sendError(res, 'Agency not found', 404);
      } else {
        sendError(res, error.message || 'Failed to reject agency', 500);
      }
    }
  }

  /**
   * Delete an agency
   * DELETE /api/admin/agencies/:id
   */
  async deleteAgency(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await adminService.deleteAgency(id);
      sendSuccess(res, null, 'Agency deleted successfully');
    } catch (error: any) {
      if (error.code === 'P2025') {
        sendError(res, 'Agency not found', 404);
      } else {
        sendError(res, error.message || 'Failed to delete agency', 500);
      }
    }
  }

  /**
   * Get all hotels
   * GET /api/admin/hotels
   */
  async getHotels(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await adminService.getHotels(page, limit, status, search);
      sendSuccess(res, result, 'Hotels retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get hotels', 500);
    }
  }

  /**
   * Approve a hotel
   * POST /api/admin/hotels/:id/approve
   */
  async approveHotel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      const hotel = await adminService.approveHotel(id, reason);
      sendSuccess(res, hotel, 'Hotel approved successfully');
    } catch (error: any) {
      if (error.code === 'P2025') {
        sendError(res, 'Hotel not found', 404);
      } else {
        sendError(res, error.message || 'Failed to approve hotel', 500);
      }
    }
  }

  /**
   * Reject a hotel
   * POST /api/admin/hotels/:id/reject
   */
  async rejectHotel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      const hotel = await adminService.rejectHotel(id, reason);
      sendSuccess(res, hotel, 'Hotel rejected successfully');
    } catch (error: any) {
      if (error.code === 'P2025') {
        sendError(res, 'Hotel not found', 404);
      } else {
        sendError(res, error.message || 'Failed to reject hotel', 500);
      }
    }
  }

  /**
   * Get all vehicles
   * GET /api/admin/vehicles
   */
  async getVehicles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await adminService.getVehicles(page, limit, status, search);
      sendSuccess(res, result, 'Vehicles retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get vehicles', 500);
    }
  }

  /**
   * Approve a vehicle
   * POST /api/admin/vehicles/:id/approve
   */
  async approveVehicle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      const vehicle = await adminService.approveVehicle(id, reason);
      sendSuccess(res, vehicle, 'Vehicle approved successfully');
    } catch (error: any) {
      if (error.code === 'P2025') {
        sendError(res, 'Vehicle not found', 404);
      } else {
        sendError(res, error.message || 'Failed to approve vehicle', 500);
      }
    }
  }

  /**
   * Reject a vehicle
   * POST /api/admin/vehicles/:id/reject
   */
  async rejectVehicle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      const vehicle = await adminService.rejectVehicle(id, reason);
      sendSuccess(res, vehicle, 'Vehicle rejected successfully');
    } catch (error: any) {
      if (error.code === 'P2025') {
        sendError(res, 'Vehicle not found', 404);
      } else {
        sendError(res, error.message || 'Failed to reject vehicle', 500);
      }
    }
  }

  /**
   * Get all users
   * GET /api/admin/users
   */
  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = userPaginationSchema.parse({
        query: {
          page: req.query.page,
          limit: req.query.limit,
          status: req.query.status,
          search: req.query.search,
        },
      });
      const { page, limit, status, search } = parsed.query;

      const result = await adminService.getUsers(page, limit, search, status);
      sendSuccess(res, result, 'Users retrieved successfully');
    } catch (error: any) {
      if (error instanceof ZodError) {
        sendError(res, error.errors[0]?.message || 'Validation error', 400);
        return;
      }

      sendError(res, error.message || 'Failed to get users', 500);
    }
  }

  /**
   * Approve a traveler
   * POST /api/admin/users/:id/approve
   */
  async approveUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      const user = await adminService.approveUser(id, reason);
      sendSuccess(res, user, 'Traveler approved successfully');
    } catch (error: any) {
      if (error.code === 'P2025') {
        sendError(res, 'Traveler not found', 404);
      } else {
        sendError(res, error.message || 'Failed to approve traveler', 500);
      }
    }
  }

  /**
   * Reject a traveler
   * POST /api/admin/users/:id/reject
   */
  async rejectUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      const user = await adminService.rejectUser(id, reason);
      sendSuccess(res, user, 'Traveler rejected successfully');
    } catch (error: any) {
      if (error.code === 'P2025') {
        sendError(res, 'Traveler not found', 404);
      } else {
        sendError(res, error.message || 'Failed to reject traveler', 500);
      }
    }
  }

  /**
   * Update an agency profile
   * PATCH /api/admin/agencies/:id
   */
  async updateAgency(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = updateAgencySchema.parse({
        params: req.params,
        body: req.body,
      });

      const agency = await adminService.updateAgency(parsed.params.id, parsed.body);
      sendSuccess(res, agency, 'Agency updated successfully');
    } catch (error: any) {
      if (error instanceof ZodError) {
        sendError(res, error.errors[0]?.message || 'Validation error', 400);
        return;
      }

      if (error.code === 'P2002') {
        sendError(res, 'An agency with this email already exists', 409);
        return;
      }

      if (error.code === 'P2025') {
        sendError(res, 'Agency not found', 404);
        return;
      }

      sendError(res, error.message || 'Failed to update agency', 400);
    }
  }

  /**
   * Update a traveler profile
   * PATCH /api/admin/users/:id
   */
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = updateUserSchema.parse({
        params: req.params,
        body: req.body,
      });

      const user = await adminService.updateUser(parsed.params.id, parsed.body);
      sendSuccess(res, user, 'Traveler updated successfully');
    } catch (error: any) {
      if (error instanceof ZodError) {
        sendError(res, error.errors[0]?.message || 'Validation error', 400);
        return;
      }

      if (error.code === 'P2002') {
        sendError(res, 'A traveler with this email or CNIC already exists', 409);
        return;
      }

      if (error.code === 'P2025') {
        sendError(res, 'Traveler not found', 404);
        return;
      }

      sendError(res, error.message || 'Failed to update traveler', 400);
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/admin/reports/dashboard
   */
  async getDashboardStats(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();
      sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get dashboard stats', 500);
    }
  }

  /**
   * Get revenue chart data
   * GET /api/admin/reports/revenue
   */
  async getRevenueChartData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const range = req.query.range as string || '6months';
      const data = await adminService.getRevenueChartData(range);
      sendSuccess(res, data, 'Revenue chart data retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get revenue chart data', 500);
    }
  }

  /**
   * Get bookings chart data
   * GET /api/admin/reports/bookings
   */
  async getBookingsChartData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const range = req.query.range as string || '6months';
      const data = await adminService.getBookingsChartData(range);
      sendSuccess(res, data, 'Bookings chart data retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get bookings chart data', 500);
    }
  }

  /**
   * Get user growth chart data
   * GET /api/admin/reports/user-growth
   */
  async getUserGrowthData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const range = req.query.range as string || '6months';
      const data = await adminService.getUserGrowthData(range);
      sendSuccess(res, data, 'User growth data retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get user growth data', 500);
    }
  }
}

// Export singleton instance
export const adminController = new AdminController();
