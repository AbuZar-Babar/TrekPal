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
  private async getVehicleProviderByAuthUser(req: AuthRequest) {
    if (!req.user) {
      return null;
    }

    return prisma.vehicleProvider.findUnique({
      where: { authUid: req.user.uid },
    });
  }

  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const provider = await prisma.vehicleProvider.findUnique({
        where: { authUid: req.user.uid },
        select: { id: true },
      });

      if (!provider) {
        sendError(res, 'Vehicle provider not found', 404);
        return;
      }

      if (!req.file) {
        sendError(res, 'Image file is required', 400);
        return;
      }

      const objectPath = buildMediaObjectPath(
        `vehicles/${provider.id}`,
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
      let provider = await prisma.vehicleProvider.findUnique({
        where: { authUid: req.user.uid },
      });

      if (!provider && process.env.NODE_ENV === 'development') {
        provider = await prisma.vehicleProvider.upsert({
          where: { authUid: req.user.uid },
          update: {},
          create: {
            authUid: req.user.uid,
            email: req.user.email || 'vehicle@trekpal.com',
            name: 'Development Vehicle Provider',
            phone: '+1234567890',
            address: 'Development Address',
            officeCity: 'Islamabad',
            license: `DEV-LIC-${Date.now()}`,
            ownerName: 'Development Owner',
            cnic: `1234567${Math.floor(100000 + Math.random() * 899999)}`,
            status: 'APPROVED',
          },
        });
      }

      if (!provider) {
        sendError(res, 'Vehicle provider not found', 404);
        return;
      }

      const result = await transportService.createVehicle(provider.id, req.body);
      sendSuccess(res, result, 'Vehicle created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create vehicle', 400);
    }
  }

  async getDrivers(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const provider = await this.getVehicleProviderByAuthUser(req);
      if (!provider) {
        sendError(res, 'Vehicle provider not found', 404);
        return;
      }

      const result = await transportService.getOwnerDrivers(provider.id);
      sendSuccess(res, result, 'Drivers retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get drivers', 400);
    }
  }

  async createDriver(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const provider = await this.getVehicleProviderByAuthUser(req);
      if (!provider) {
        sendError(res, 'Vehicle provider not found', 404);
        return;
      }

      const result = await transportService.createDriver(provider.id, req.body);
      sendSuccess(res, result, 'Driver created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create driver', 400);
    }
  }

  async updateDriver(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const provider = await this.getVehicleProviderByAuthUser(req);
      if (!provider) {
        sendError(res, 'Vehicle provider not found', 404);
        return;
      }

      const result = await transportService.updateDriver(req.params.id, provider.id, req.body);
      sendSuccess(res, result, 'Driver updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update driver', 400);
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
      const provider = await prisma.vehicleProvider.findUnique({
        where: { authUid: req.user.uid },
      });

      if (!provider) {
        sendError(res, 'Vehicle provider not found', 404);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await transportService.getOwnerVehicles(
        provider.id,
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
      const startDateStr = req.query.startDate as string | undefined;
      const endDateStr = req.query.endDate as string | undefined;
      const dedicatedVehicleStr = req.query.dedicatedVehicle as string | undefined;

      const startDate = startDateStr ? new Date(startDateStr) : undefined;
      const endDate = endDateStr ? new Date(endDateStr) : undefined;
      const dedicatedVehicle = dedicatedVehicleStr === 'false' ? false : true;

      const result = await transportService.getVehicles(
        page,
        limit,
        status,
        search,
        undefined,
        startDate,
        endDate,
        dedicatedVehicle,
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
      const provider = await prisma.vehicleProvider.findUnique({
        where: { authUid: req.user.uid },
      });
      const result = await transportService.getVehicleById(
        id,
        provider?.id,
      );
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
      const provider = await prisma.vehicleProvider.findUnique({
        where: { authUid: req.user.uid },
      });

      if (!provider) {
        sendError(res, 'Vehicle provider not found', 404);
        return;
      }

      const result = await transportService.updateVehicle(id, provider.id, req.body);
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
      const provider = await prisma.vehicleProvider.findUnique({
        where: { authUid: req.user.uid },
      });

      if (!provider) {
        sendError(res, 'Vehicle provider not found', 404);
        return;
      }

      await transportService.deleteVehicle(id, provider.id);
      sendSuccess(res, null, 'Vehicle deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete vehicle', 400);
    }
  }
}

export const transportController = new TransportController();



