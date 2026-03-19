import { Router } from 'express';
import { bookingsController } from './bookings.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAgencyOrAdmin } from '../../middlewares/roleGuard.middleware';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/bookings
 * @desc    Get bookings (traveler sees own, agency sees own)
 * @access  Private (All authenticated roles)
 */
router.get('/', bookingsController.getBookings.bind(bookingsController));

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private (All authenticated roles)
 */
router.get('/:id', bookingsController.getBookingById.bind(bookingsController));

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update booking status (CONFIRMED, CANCELLED, COMPLETED)
 * @access  Private (Agency or Admin)
 */
router.put(
  '/:id/status',
  requireAgencyOrAdmin,
  bookingsController.updateBookingStatus.bind(bookingsController)
);

export default router;
