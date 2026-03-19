import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireTraveler } from '../../middlewares/roleGuard.middleware';

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
router.put('/profile', usersController.updateProfile.bind(usersController));

export default router;
