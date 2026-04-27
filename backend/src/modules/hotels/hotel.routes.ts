import { Router } from 'express';
import { hotelsController } from './hotels.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAgencyOrAdmin, requireHotelAgencyOrAdmin } from '../../middlewares/roleGuard.middleware';
import { createMediaImageUpload } from '../../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

// Publicly available (discovery) for logged in users
router.get('/', hotelsController.getHotels.bind(hotelsController));
router.get('/:id', hotelsController.getHotelById.bind(hotelsController));

// Management routes (Hotels can manage themselves, Agencies can manage theirs, Admins can manage all)
router.post('/upload-image', requireHotelAgencyOrAdmin, createMediaImageUpload('hotels') as any, hotelsController.uploadImage.bind(hotelsController));
router.post('/', requireHotelAgencyOrAdmin, hotelsController.createHotel.bind(hotelsController));
router.put('/:id', requireHotelAgencyOrAdmin, hotelsController.updateHotel.bind(hotelsController));
router.delete('/:id', requireHotelAgencyOrAdmin, hotelsController.deleteHotel.bind(hotelsController));

// Room management
router.post('/:id/rooms', requireHotelAgencyOrAdmin, hotelsController.addRoom.bind(hotelsController));
router.put('/rooms/:roomId', requireHotelAgencyOrAdmin, hotelsController.updateRoom.bind(hotelsController));
router.delete('/rooms/:roomId', requireHotelAgencyOrAdmin, hotelsController.deleteRoom.bind(hotelsController));
router.get('/rooms/:roomId/availability', hotelsController.checkRoomAvailability.bind(hotelsController));

// Service management
router.post('/:id/services', requireHotelAgencyOrAdmin, hotelsController.addService.bind(hotelsController));
router.put('/services/:serviceId', requireHotelAgencyOrAdmin, hotelsController.updateService.bind(hotelsController));
router.delete('/services/:serviceId', requireHotelAgencyOrAdmin, hotelsController.deleteService.bind(hotelsController));

export default router;
