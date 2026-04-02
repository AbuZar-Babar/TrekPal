import { Router } from 'express';
import { hotelsController } from './hotels.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAgencyOrAdmin } from '../../middlewares/roleGuard.middleware';
import { createMediaImageUpload } from '../../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);
router.use(requireAgencyOrAdmin);

router.get('/', hotelsController.getHotels.bind(hotelsController));
router.post('/upload-image', createMediaImageUpload('hotels') as any, hotelsController.uploadImage.bind(hotelsController));
router.get('/:id', hotelsController.getHotelById.bind(hotelsController));
router.post('/', hotelsController.createHotel.bind(hotelsController));
router.put('/:id', hotelsController.updateHotel.bind(hotelsController));
router.delete('/:id', hotelsController.deleteHotel.bind(hotelsController));

export default router;

