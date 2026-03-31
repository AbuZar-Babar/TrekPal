import { Router } from 'express';
import { bidsController } from './bids.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAgency, requireTraveler } from '../../middlewares/roleGuard.middleware';

const router = Router();

// All bid routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/bids
 * @desc    Submit a bid on a trip request
 * @access  Private (Agency only, must be approved)
 */
router.post('/', requireAgency, bidsController.createBid.bind(bidsController));

/**
 * @route   GET /api/bids
 * @desc    Get bids (agency sees own bids)
 * @access  Private (Agency)
 */
router.get('/', bidsController.getBids.bind(bidsController));

/**
 * @route   GET /api/bids/trip-request/:tripRequestId
 * @desc    Get all bids for a specific trip request
 * @access  Private (All authenticated roles)
 */
router.get(
  '/trip-request/:tripRequestId',
  bidsController.getBidsForTripRequest.bind(bidsController)
);

/**
 * @route   GET /api/bids/:id
 * @desc    Get a single bid thread with revision history
 * @access  Private (Traveler owner, agency owner, admin)
 */
router.get('/:id', bidsController.getBidById.bind(bidsController));

/**
 * @route   POST /api/bids/:id/counteroffer
 * @desc    Submit a counteroffer on an existing bid thread
 * @access  Private (Traveler owner or agency owner)
 */
router.post('/:id/counteroffer', bidsController.createCounterOffer.bind(bidsController));

/**
 * @route   POST /api/bids/:id/accept
 * @desc    Accept a bid (creates booking transactionally)
 * @access  Private (Traveler only, must own the trip request)
 */
router.post('/:id/accept', requireTraveler, bidsController.acceptBid.bind(bidsController));

export default router;
