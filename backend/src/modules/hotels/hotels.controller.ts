import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { hotelsService } from './hotels.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { prisma } from '../../config/database';
import { ROLES } from '../../config/constants';
import { roomAvailabilityService } from './room-availability.service';

export class HotelsController {
  async getHotels(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const discovery = req.query.discovery === 'true';

      const actor = {
        role: req.user?.role || '',
        agencyId: '',
        authUid: req.user?.uid || '',
      };

      if (req.user?.role === ROLES.AGENCY) {
        const agency = await prisma.agency.findUnique({
          where: { authUid: req.user.uid },
          select: { id: true },
        });
        if (agency) actor.agencyId = agency.id;
      }

      const result = await hotelsService.getHotels({ page, limit, status, search, discovery }, actor);
      sendSuccess(res, result, 'Hotels retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get hotels', 500);
    }
  }

  async getHotelById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const actor = {
        role: req.user?.role || '',
        agencyId: '',
        authUid: req.user?.uid || '',
      };

      if (req.user?.role === ROLES.AGENCY) {
        const agency = await prisma.agency.findUnique({
          where: { authUid: req.user.uid },
          select: { id: true },
        });
        if (agency) actor.agencyId = agency.id;
      }

      const result = await hotelsService.getHotelById(id, actor);
      sendSuccess(res, result, 'Hotel retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Hotel not found', 404);
    }
  }

  async createHotel(req: AuthRequest, res: Response): Promise<void> {
    try {
      let agencyId: string | null = null;
      let authUid: string | undefined = undefined;

      if (req.user?.role === ROLES.AGENCY) {
        const agency = await prisma.agency.findUnique({
          where: { authUid: req.user.uid },
          select: { id: true },
        });
        if (!agency) {
          sendError(res, 'Agency not found', 404);
          return;
        }
        agencyId = agency.id;
      } else if (req.user?.role === 'HOTEL') {
        authUid = req.user.uid;
      }

      const result = await hotelsService.createHotel(agencyId, req.body, authUid);
      sendSuccess(res, result, 'Hotel created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create hotel', 400);
    }
  }

  async updateHotel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Ownership check should ideally be in service or middleware
      // For now, let's just allow the service to handle it if we pass actor info
      const result = await hotelsService.updateHotel(id, req.body);
      sendSuccess(res, result, 'Hotel updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update hotel', 400);
    }
  }

  async deleteHotel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await hotelsService.deleteHotel(id);
      sendSuccess(res, null, 'Hotel deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete hotel', 400);
    }
  }

  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'No image uploaded', 400);
        return;
      }
      // @ts-ignore
      sendSuccess(res, { url: req.file.key || req.file.path }, 'Image uploaded successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to upload image', 500);
    }
  }

  // --- Room Handlers ---

  async addRoom(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id: hotelId } = req.params;
      const result = await hotelsService.addRoom(hotelId, req.body);
      sendSuccess(res, result, 'Room added successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to add room', 400);
    }
  }

  async updateRoom(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const result = await hotelsService.updateRoom(roomId, req.body);
      sendSuccess(res, result, 'Room updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update room', 400);
    }
  }

  async deleteRoom(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      await hotelsService.deleteRoom(roomId);
      sendSuccess(res, null, 'Room deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete room', 400);
    }
  }

  async checkRoomAvailability(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const { startDate, endDate, count } = req.query;

      if (!startDate || !endDate) {
        sendError(res, 'Start date and end date are required', 400);
        return;
      }

      const available = await roomAvailabilityService.checkAvailability(
        roomId,
        new Date(startDate as string),
        new Date(endDate as string),
        parseInt(count as string) || 1
      );

      sendSuccess(res, { available }, 'Availability checked successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to check availability', 400);
    }
  }

  // --- Service Handlers ---

  async addService(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id: hotelId } = req.params;
      const result = await hotelsService.addService(hotelId, req.body);
      sendSuccess(res, result, 'Service added successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to add service', 400);
    }
  }

  async updateService(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const result = await hotelsService.updateService(serviceId, req.body);
      sendSuccess(res, result, 'Service updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update service', 400);
    }
  }

  async deleteService(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      await hotelsService.deleteService(serviceId);
      sendSuccess(res, null, 'Service deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete service', 400);
    }
  }
}

export const hotelsController = new HotelsController();
