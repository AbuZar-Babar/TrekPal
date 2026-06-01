import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { reviewsService } from './reviews.service';

const createReviewSchema = z.object({
  bookingId: z.string().trim().min(1, 'Booking ID is required'),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

async function getTravelerId(uid: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { authUid: uid }, select: { id: true } });
  if (!user) throw new Error('User not found');
  return user.id;
}

async function getAgencyId(uid: string): Promise<string> {
  const agency = await prisma.agency.findUnique({ where: { authUid: uid }, select: { id: true } });
  if (!agency) throw new Error('Agency not found');
  return agency.id;
}

export class ReviewsController {
  async createReview(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid input', details: parsed.error.errors });
    }

    try {
      const userId = await getTravelerId(req.user.uid);
      const review = await reviewsService.createReview(userId, parsed.data);
      return res.status(201).json({ success: true, data: review });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403
        : err.message.includes('not found') ? 404
        : err.message.includes('already reviewed') ? 409
        : err.message.includes('completed') ? 422
        : 400;
      return res.status(status).json({ message: err.message });
    }
  }

  async getReviewForBooking(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { bookingId } = req.params;
    try {
      const userId = await getTravelerId(req.user.uid);
      const review = await reviewsService.getReviewForBooking(bookingId, userId);
      return res.json({ success: true, data: review });
    } catch (err: any) {
      return res.status(err.message.includes('Unauthorized') ? 403 : 500).json({ message: err.message });
    }
  }

  async getAgencyReviews(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const parsed = paginationSchema.safeParse(req.query);
    const params = parsed.success ? parsed.data : { page: 1, limit: 20 };

    try {
      const agencyId = await getAgencyId(req.user.uid);
      const result = await reviewsService.getAgencyReviews(agencyId, params);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  async getHotelReviews(req: AuthRequest, res: Response) {
    const { hotelId } = req.params;
    const parsed = paginationSchema.safeParse(req.query);
    const params = parsed.success ? parsed.data : { page: 1, limit: 20 };

    try {
      const result = await reviewsService.getHotelReviews(hotelId, params);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export const reviewsController = new ReviewsController();
