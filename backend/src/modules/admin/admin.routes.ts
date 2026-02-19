import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/roleGuard.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/agencies
 * @desc    Get all agencies with filtering and pagination
 * @access  Private (Admin only)
 */
router.get('/agencies', adminController.getAgencies.bind(adminController));

/**
 * @route   POST /api/admin/agencies/:id/approve
 * @desc    Approve an agency
 * @access  Private (Admin only)
 */
router.post(
  '/agencies/:id/approve',
  adminController.approveAgency.bind(adminController)
);

/**
 * @route   POST /api/admin/agencies/:id/reject
 * @desc    Reject an agency
 * @access  Private (Admin only)
 */
router.post(
  '/agencies/:id/reject',
  adminController.rejectAgency.bind(adminController)
);

/**
 * @route   DELETE /api/admin/agencies/:id
 * @desc    Delete an agency permanently
 * @access  Private (Admin only)
 */
router.delete(
  '/agencies/:id',
  adminController.deleteAgency.bind(adminController)
);

/**
 * @route   GET /api/admin/hotels
 * @desc    Get all hotels with filtering and pagination
 * @access  Private (Admin only)
 */
router.get('/hotels', adminController.getHotels.bind(adminController));

/**
 * @route   POST /api/admin/hotels/:id/approve
 * @desc    Approve a hotel
 * @access  Private (Admin only)
 */
router.post(
  '/hotels/:id/approve',
  adminController.approveHotel.bind(adminController)
);

/**
 * @route   POST /api/admin/hotels/:id/reject
 * @desc    Reject a hotel
 * @access  Private (Admin only)
 */
router.post(
  '/hotels/:id/reject',
  adminController.rejectHotel.bind(adminController)
);

/**
 * @route   GET /api/admin/vehicles
 * @desc    Get all vehicles with filtering and pagination
 * @access  Private (Admin only)
 */
router.get('/vehicles', adminController.getVehicles.bind(adminController));

/**
 * @route   POST /api/admin/vehicles/:id/approve
 * @desc    Approve a vehicle
 * @access  Private (Admin only)
 */
router.post(
  '/vehicles/:id/approve',
  adminController.approveVehicle.bind(adminController)
);

/**
 * @route   POST /api/admin/vehicles/:id/reject
 * @desc    Reject a vehicle
 * @access  Private (Admin only)
 */
router.post(
  '/vehicles/:id/reject',
  adminController.rejectVehicle.bind(adminController)
);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Private (Admin only)
 */
router.get('/users', adminController.getUsers.bind(adminController));

/**
 * @route   GET /api/admin/reports/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get(
  '/reports/dashboard',
  adminController.getDashboardStats.bind(adminController)
);

/**
 * @route   GET /api/admin/reports/revenue
 * @desc    Get revenue chart data
 * @access  Private (Admin only)
 */
router.get(
  '/reports/revenue',
  adminController.getRevenueChartData.bind(adminController)
);

/**
 * @route   GET /api/admin/reports/bookings
 * @desc    Get bookings chart data
 * @access  Private (Admin only)
 */
router.get(
  '/reports/bookings',
  adminController.getBookingsChartData.bind(adminController)
);

/**
 * @route   GET /api/admin/reports/user-growth
 * @desc    Get user growth chart data
 * @access  Private (Admin only)
 */
router.get(
  '/reports/user-growth',
  adminController.getUserGrowthData.bind(adminController)
);

export default router;
