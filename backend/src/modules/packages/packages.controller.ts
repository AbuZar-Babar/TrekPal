import { Response } from 'express';
import { prisma } from '../../config/database';
import { ROLES } from '../../config/constants';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendError, sendSuccess } from '../../utils/response.util';
import {
  applyPackageSchema,
  createPackageSchema,
  packageFiltersSchema,
  updatePackageSchema,
} from './packages.types';
import { packagesService } from './packages.service';

export class PackagesController {
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

  async getPackages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const filters = packageFiltersSchema.parse({
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        active: req.query.active,
      });

      const result = await packagesService.getPackages(filters, actor);
      sendSuccess(res, result, 'Trip offers retrieved successfully');
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 400;
      sendError(res, error.message || 'Failed to get trip offers', statusCode);
    }
  }

  async getPackageById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const result = await packagesService.getPackageById(req.params.id, actor);
      sendSuccess(res, result, 'Trip offer retrieved successfully');
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 404;
      sendError(res, error.message || 'Failed to get trip offer', statusCode);
    }
  }

  async createPackage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      if (!actor.agencyId) {
        sendError(res, 'Only agencies can create trip offers', 403);
        return;
      }

      const input = createPackageSchema.parse(req.body);
      const result = await packagesService.createPackage(actor.agencyId, input);
      sendSuccess(res, result, 'Trip offer created successfully', 201);
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 400;
      sendError(res, error.message || 'Failed to create trip offer', statusCode);
    }
  }

  async updatePackage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      if (!actor.agencyId) {
        sendError(res, 'Only agencies can update trip offers', 403);
        return;
      }

      const input = updatePackageSchema.parse(req.body);
      const result = await packagesService.updatePackage(req.params.id, actor.agencyId, input);
      sendSuccess(res, result, 'Trip offer updated successfully');
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 400;
      sendError(res, error.message || 'Failed to update trip offer', statusCode);
    }
  }

  async deletePackage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      if (!actor.agencyId) {
        sendError(res, 'Only agencies can delete trip offers', 403);
        return;
      }

      await packagesService.deletePackage(req.params.id, actor.agencyId);
      sendSuccess(res, null, 'Trip offer deleted successfully');
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 400;
      sendError(res, error.message || 'Failed to delete trip offer', statusCode);
    }
  }

  async applyToPackage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const traveler = await prisma.user.findUnique({
        where: { authUid: req.user.uid },
        select: { id: true },
      });

      if (!traveler) {
        sendError(res, 'Traveler not found', 404);
        return;
      }

      const input = applyPackageSchema.parse(req.body ?? {});
      const result = await packagesService.applyToPackage(req.params.id, traveler.id, input);
      sendSuccess(res, result, 'Trip offer request sent successfully', 201);
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 401 : 400;
      sendError(res, error.message || 'Failed to apply to trip offer', statusCode);
    }
  }
}

export const packagesController = new PackagesController();
