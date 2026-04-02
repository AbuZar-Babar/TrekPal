import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { prisma } from '../../config/database';
import { sendError, sendSuccess } from '../../utils/response.util';
import { ROLES } from '../../config/constants';
import {
  createHotelSchema,
  hotelFiltersSchema,
  updateHotelSchema,
} from './hotels.types';
import { hotelsService } from './hotels.service';
import { buildMediaObjectPath, createSignedMediaUrl, uploadMediaFile } from '../../services/media-storage.service';

export class HotelsController {
  private async getActor(req: AuthRequest): Promise<{ role: string; agencyId?: string }> {
    if (!req.user) {
      throw new Error('Unauthorized');
    }

    if (req.user.role === ROLES.AGENCY) {
      const agency = await prisma.agency.findUnique({
        where: { authUid: req.user.uid },
        select: { id: true },
      });

      if (!agency) {
        throw new Error('Agency not found');
      }

      return { role: req.user.role, agencyId: agency.id };
    }

    return { role: req.user.role };
  }

  async getHotels(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const filters = hotelFiltersSchema.parse({
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
        search: req.query.search,
      });

      const result = await hotelsService.getHotels(filters, actor);
      sendSuccess(res, result, 'Hotels retrieved successfully');
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 400;
      sendError(res, error.message || 'Failed to get hotels', statusCode);
    }
  }

  async getHotelById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const result = await hotelsService.getHotelById(req.params.id, actor);
      sendSuccess(res, result, 'Hotel retrieved successfully');
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 404;
      sendError(res, error.message || 'Failed to get hotel', statusCode);
    }
  }

  async createHotel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      if (!actor.agencyId) {
        sendError(res, 'Only agencies can create hotels', 403);
        return;
      }

      const input = createHotelSchema.parse(req.body);
      const result = await hotelsService.createHotel(actor.agencyId, input);
      sendSuccess(res, result, 'Hotel created successfully', 201);
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 400;
      sendError(res, error.message || 'Failed to create hotel', statusCode);
    }
  }

  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      if (!actor.agencyId) {
        sendError(res, 'Only agencies can upload hotel images', 403);
        return;
      }

      if (!req.file) {
        sendError(res, 'Image file is required', 400);
        return;
      }

      const objectPath = buildMediaObjectPath(
        `hotels/${actor.agencyId}`,
        `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        req.file.mimetype,
        req.file.originalname,
      );
      await uploadMediaFile(req.file.buffer, req.file.mimetype, objectPath);
      const imageUrl = await createSignedMediaUrl(objectPath);
      sendSuccess(res, { url: imageUrl }, 'Hotel image uploaded successfully', 201);
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 400;
      sendError(res, error.message || 'Failed to upload hotel image', statusCode);
    }
  }

  async updateHotel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      if (!actor.agencyId) {
        sendError(res, 'Only agencies can update hotels', 403);
        return;
      }

      const input = updateHotelSchema.parse(req.body);
      const result = await hotelsService.updateHotel(req.params.id, actor.agencyId, input);
      sendSuccess(res, result, 'Hotel updated successfully');
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 400;
      sendError(res, error.message || 'Failed to update hotel', statusCode);
    }
  }

  async deleteHotel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      if (!actor.agencyId) {
        sendError(res, 'Only agencies can delete hotels', 403);
        return;
      }

      await hotelsService.deleteHotel(req.params.id, actor.agencyId);
      sendSuccess(res, null, 'Hotel deleted successfully');
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 400;
      sendError(res, error.message || 'Failed to delete hotel', statusCode);
    }
  }
}

export const hotelsController = new HotelsController();
