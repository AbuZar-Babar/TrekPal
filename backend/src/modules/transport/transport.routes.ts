import { Router } from 'express';
import { transportController } from './transport.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAgency } from '../../middlewares/roleGuard.middleware';
import { createMediaImageUpload } from '../../middlewares/upload.middleware';

const router = Router();

// Discovery routes (Publicly available for all logged-in users)
router.use(authenticate);
router.get('/', transportController.getVehicles.bind(transportController));
router.get('/:id', transportController.getVehicleById.bind(transportController));

// Management routes (Agency only)
router.use(requireAgency);

/**
 * @route   POST /api/transport
 * @desc    Create a new vehicle
 * @access  Private (Agency only)
 */
router.post('/', transportController.createVehicle.bind(transportController));

/**
 * @route   POST /api/transport/upload-image
 * @desc    Upload a vehicle image
 * @access  Private (Agency only)
 */
router.post('/upload-image', createMediaImageUpload('vehicles') as any, transportController.uploadImage.bind(transportController));

/**
 * @route   GET /api/transport/my-vehicles
 * @desc    Get all vehicles for the agency
 * @access  Private (Agency only)
 */
router.get('/my-vehicles', transportController.getAgencyVehicles.bind(transportController));

/**
 * @route   PUT /api/transport/:id
 * @desc    Update vehicle
 * @access  Private (Agency only)
 */
router.put('/:id', transportController.updateVehicle.bind(transportController));

/**
 * @route   DELETE /api/transport/:id
 * @desc    Delete vehicle
 * @access  Private (Agency only)
 */
router.delete('/:id', transportController.deleteVehicle.bind(transportController));


export default router;
