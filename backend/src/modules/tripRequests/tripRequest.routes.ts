import { Router } from 'express';
import { tripRequestsController } from './tripRequests.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireTraveler } from '../../middlewares/roleGuard.middleware';

const router = Router();

// All trip request routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/trip-requests
 * @desc    Create a new trip request
 * @access  Private (Traveler only)
 */
router.post('/', requireTraveler, tripRequestsController.createTripRequest.bind(tripRequestsController));

/**
 * @route   GET /api/trip-requests
 * @desc    Get trip requests (role-based filtering)
 * @access  Private (All authenticated roles)
 */
router.get('/', tripRequestsController.getTripRequests.bind(tripRequestsController));

/**
 * @route   GET /api/trip-requests/:id
 * @desc    Get trip request by ID
 * @access  Private (All authenticated roles)
 */
router.get('/:id', tripRequestsController.getTripRequestById.bind(tripRequestsController));

/**
 * @route   PUT /api/trip-requests/:id
 * @desc    Update a trip request
 * @access  Private (Traveler, own request only)
 */
router.put('/:id', requireTraveler, tripRequestsController.updateTripRequest.bind(tripRequestsController));

/**
 * @route   DELETE /api/trip-requests/:id
 * @desc    Cancel a trip request
 * @access  Private (Traveler, own request only)
 */
router.delete('/:id', requireTraveler, tripRequestsController.cancelTripRequest.bind(tripRequestsController));

export default router;
