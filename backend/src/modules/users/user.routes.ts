import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadTravelerKycDocuments } from '../../middlewares/upload.middleware';
import { requireTraveler } from '../../middlewares/roleGuard.middleware';
import { validateBody } from '../../middlewares/validation.middleware';
import { submitTravelerKycSchema, updateProfileSchema } from './users.types';

const router = Router();

// All user routes require authentication and traveler role
router.use(authenticate);
router.use(requireTraveler);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private (Traveler only)
 */
router.get('/profile', usersController.getProfile.bind(usersController));

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private (Traveler only)
 */
router.put(
  '/profile',
  validateBody(updateProfileSchema),
  usersController.updateProfile.bind(usersController),
);

/**
 * @route   POST /api/users/profile/kyc
 * @desc    Submit traveler KYC details and required images
 * @access  Private (Traveler only)
 */
router.post(
  '/profile/kyc',
  uploadTravelerKycDocuments as any,
  validateBody(submitTravelerKycSchema),
  usersController.submitTravelerKyc.bind(usersController),
);

export default router;
