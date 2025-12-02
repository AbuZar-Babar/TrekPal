import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { adminService } from './admin.service';
import { sendSuccess, sendError } from '../../utils/response.util';

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

      const result = await adminService.getAgencies(page, limit, status, search);
      sendSuccess(res, result, 'Agencies retrieved successfully');
    } catch (error: any) {
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;

      const result = await adminService.getUsers(page, limit, search);
      sendSuccess(res, result, 'Users retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get users', 500);
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/admin/reports/dashboard
   */
  async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();
      sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get dashboard stats', 500);
    }
  }
}

export const adminController = new AdminController();
