import { Router } from 'express';
import { transportController } from './transport.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAgency } from '../../middlewares/roleGuard.middleware';

const router = Router();

// All transport routes require authentication and agency role
router.use(authenticate);
router.use(requireAgency);

/**
 * @route   POST /api/transport
 * @desc    Create a new vehicle
 * @access  Private (Agency only)
 */
router.post('/', transportController.createVehicle.bind(transportController));

/**
 * @route   GET /api/transport
 * @desc    Get all vehicles for the agency
 * @access  Private (Agency only)
 */
router.get('/', transportController.getAgencyVehicles.bind(transportController));

/**
 * @route   GET /api/transport/:id
 * @desc    Get vehicle by ID
 * @access  Private (Agency only)
 */
router.get('/:id', transportController.getVehicleById.bind(transportController));

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
