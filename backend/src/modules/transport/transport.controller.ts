import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { transportService } from './transport.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { prisma } from '../../config/database';
import { buildMediaObjectPath, createSignedMediaUrl, uploadMediaFile } from '../../services/media-storage.service';

/**
 * Transport Controller
 * Handles HTTP requests for transport/vehicles
 */
export class TransportController {
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const agency = await prisma.agency.findUnique({
        where: { authUid: req.user.uid },
        select: { id: true },
      });

      if (!agency) {
        sendError(res, 'Agency not found', 404);
        return;
      }

      if (!req.file) {
        sendError(res, 'Image file is required', 400);
        return;
      }

      const objectPath = buildMediaObjectPath(
        `vehicles/${agency.id}`,
        `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        req.file.mimetype,
        req.file.originalname,
      );
      await uploadMediaFile(req.file.buffer, req.file.mimetype, objectPath);
      const imageUrl = await createSignedMediaUrl(objectPath);
      sendSuccess(res, { url: imageUrl }, 'Vehicle image uploaded successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to upload vehicle image', 400);
    }
  }

  /**
   * Create a new vehicle
   * POST /api/transport
   */
  async createVehicle(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      // Get agency ID from user
      let agency = await prisma.agency.findUnique({
        where: { authUid: req.user.uid },
      });

      // In development mode, create a dummy agency if it doesn't exist
      if (!agency && process.env.NODE_ENV === 'development') {
        agency = await prisma.agency.upsert({
          where: { authUid: req.user.uid },
          update: {},
          create: {
            authUid: req.user.uid,
            email: req.user.email || 'agency@trekpal.com',
            name: 'Development Agency',
            phone: '+1234567890',
            status: 'APPROVED',
          },
        });
      }

      if (!agency) {
        sendError(res, 'Agency not found', 404);
        return;
      }

      const result = await transportService.createVehicle(agency.id, req.body);
      sendSuccess(res, result, 'Vehicle created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create vehicle', 400);
    }
  }

  /**
   * Get all vehicles for an agency
   * GET /api/transport/agency
   */
  async getAgencyVehicles(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      // Get agency ID from user
      let agency = await prisma.agency.findUnique({
        where: { authUid: req.user.uid },
      });

      // In development mode, create a dummy agency if it doesn't exist
      if (!agency && process.env.NODE_ENV === 'development') {
        agency = await prisma.agency.upsert({
          where: { authUid: req.user.uid },
          update: {},
          create: {
            authUid: req.user.uid,
            email: req.user.email || 'agency@trekpal.com',
            name: 'Development Agency',
            phone: '+1234567890',
            status: 'APPROVED',
          },
        });
      }

      if (!agency) {
        sendError(res, 'Agency not found', 404);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await transportService.getAgencyVehicles(
        agency.id,
        page,
        limit,
        status,
        search
      );
      sendSuccess(res, result, 'Vehicles retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get vehicles', 400);
    }
  }

  /**
   * Get all vehicles (for travelers/admins)
   * GET /api/transport
   */
  async getVehicles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await transportService.getVehicles(
        page,
        limit,
        status,
        search
      );
      sendSuccess(res, result, 'Vehicles retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get vehicles', 400);
    }
  }

  /**
   * Get vehicle by ID
   * GET /api/transport/:id
   */
  async getVehicleById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { id } = req.params;

      // Get agency ID if user is agency
      let agencyId: string | undefined;
      const agency = await prisma.agency.findUnique({
        where: { authUid: req.user.uid },
      });
      if (agency) {
        agencyId = agency.id;
      }

      const result = await transportService.getVehicleById(id, agencyId);
      sendSuccess(res, result, 'Vehicle retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Vehicle not found', 404);
    }
  }

  /**
   * Update vehicle
   * PUT /api/transport/:id
   */
  async updateVehicle(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { id } = req.params;

      // Get agency ID from user
      let agency = await prisma.agency.findUnique({
        where: { authUid: req.user.uid },
      });

      // In development mode, create a dummy agency if it doesn't exist
      if (!agency && process.env.NODE_ENV === 'development') {
        agency = await prisma.agency.upsert({
          where: { authUid: req.user.uid },
          update: {},
          create: {
            authUid: req.user.uid,
            email: req.user.email || 'agency@trekpal.com',
            name: 'Development Agency',
            phone: '+1234567890',
            status: 'APPROVED',
          },
        });
      }

      if (!agency) {
        sendError(res, 'Agency not found', 404);
        return;
      }

      const result = await transportService.updateVehicle(id, agency.id, req.body);
      sendSuccess(res, result, 'Vehicle updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update vehicle', 400);
    }
  }

  /**
   * Delete vehicle
   * DELETE /api/transport/:id
   */
  async deleteVehicle(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { id } = req.params;

      // Get agency ID from user
      let agency = await prisma.agency.findUnique({
        where: { authUid: req.user.uid },
      });

      // In development mode, create a dummy agency if it doesn't exist
      if (!agency && process.env.NODE_ENV === 'development') {
        agency = await prisma.agency.upsert({
          where: { authUid: req.user.uid },
          update: {},
          create: {
            authUid: req.user.uid,
            email: req.user.email || 'agency@trekpal.com',
            name: 'Development Agency',
            phone: '+1234567890',
            status: 'APPROVED',
          },
        });
      }

      if (!agency) {
        sendError(res, 'Agency not found', 404);
        return;
      }

      await transportService.deleteVehicle(id, agency.id);
      sendSuccess(res, null, 'Vehicle deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete vehicle', 400);
    }
  }
}

export const transportController = new TransportController();



