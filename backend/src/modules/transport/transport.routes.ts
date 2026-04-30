import { Router } from 'express';
import { transportController } from './transport.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAgency } from '../../middlewares/roleGuard.middleware';
import { createMediaImageUpload } from '../../middlewares/upload.middleware';

const router = Router();

// Discovery routes (Publicly available for all logged-in users)
router.use(authenticate);
router.get('/', transportController.getVehicles.bind(transportController));

// Management routes (Agency only)

/**
 * @route   POST /api/transport
 * @desc    Create a new vehicle
 * @access  Private (Agency only)
 */
router.post('/', requireAgency, transportController.createVehicle.bind(transportController));

/**
 * @route   POST /api/transport/upload-image
 * @desc    Upload a vehicle image
 * @access  Private (Agency only)
 */
router.post('/upload-image', requireAgency, createMediaImageUpload('vehicles') as any, transportController.uploadImage.bind(transportController));

/**
 * @route   GET /api/transport/my-vehicles
 * @desc    Get all vehicles for the agency
 * @access  Private (Agency only)
 */
router.get('/my-vehicles', requireAgency, transportController.getAgencyVehicles.bind(transportController));

/**
 * @route   GET /api/transport/:id
 * @desc    Get vehicle by ID
 * @access  Private (Authenticated)
 */
router.get('/:id', transportController.getVehicleById.bind(transportController));

/**
 * @route   PUT /api/transport/:id
 * @desc    Update vehicle
 * @access  Private (Agency only)
 */
router.put('/:id', requireAgency, transportController.updateVehicle.bind(transportController));

/**
 * @route   DELETE /api/transport/:id
 * @desc    Delete vehicle
 * @access  Private (Agency only)
 */
router.delete('/:id', requireAgency, transportController.deleteVehicle.bind(transportController));


export default router;
