import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { usersService } from './users.service';
import { sendSuccess, sendError } from '../../utils/response.util';

/**
 * Users Controller
 * Handles HTTP requests for user profiles
 */
export class UsersController {
  /**
   * Get current user profile
   * GET /api/users/profile
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const profile = await usersService.getProfile(req.user.uid);
      sendSuccess(res, profile, 'Profile retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get profile', 404);
    }
  }

  /**
   * Update current user profile
   * PUT /api/users/profile
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const profile = await usersService.updateProfile(req.user.uid, req.body);
      sendSuccess(res, profile, 'Profile updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update profile', 400);
    }
  }
}

export const usersController = new UsersController();
