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
      if (error.code === 'P2002') {
        sendError(res, 'A profile with this information already exists', 409);
        return;
      }

      sendError(res, error.message || 'Failed to update profile', 400);
    }
  }

  /**
   * Submit traveler KYC details and documents
   * POST /api/users/profile/kyc
   */
  async submitTravelerKyc(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const cnicFrontImage = files?.cnicFrontImage?.[0];
      const selfieImage = files?.selfieImage?.[0];

      if (!cnicFrontImage || !selfieImage) {
        sendError(
          res,
          'Both CNIC front image and selfie image are required',
          400,
        );
        return;
      }

      const profile = await usersService.submitTravelerKyc(req.user.uid, req.body, {
        cnicFrontImage,
        selfieImage,
      });
      sendSuccess(res, profile, 'Traveler KYC submitted for review');
    } catch (error: any) {
      if (error.code === 'P2002') {
        sendError(res, 'This CNIC is already registered with another traveler', 409);
        return;
      }

      sendError(res, error.message || 'Failed to submit traveler KYC', 400);
    }
  }
}

export const usersController = new UsersController();
