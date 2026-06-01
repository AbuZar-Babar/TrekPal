import { Router } from 'express';
import { reviewsController } from './reviews.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAgency, requireTraveler } from '../../middlewares/roleGuard.middleware';

const router = Router();

// Traveler: submit a review for a completed booking
router.post('/', authenticate, requireTraveler, (req, res) => reviewsController.createReview(req, res));

// Traveler: get their review for a specific booking
router.get('/booking/:bookingId', authenticate, requireTraveler, (req, res) => reviewsController.getReviewForBooking(req, res));

// Agency: get all reviews for their bookings
router.get('/agency', authenticate, requireAgency, (req, res) => reviewsController.getAgencyReviews(req, res));

// Public: get reviews for a hotel
router.get('/hotel/:hotelId', (req, res) => reviewsController.getHotelReviews(req, res));

export default router;
