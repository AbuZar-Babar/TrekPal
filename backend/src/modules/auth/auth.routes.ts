import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadKycDocuments } from '../../middlewares/upload.middleware';
import {
  validateBody,
} from '../../middlewares/validation.middleware';
import {
  userRegisterSchema,
  agencyRegisterSchema,
  loginSchema,
  verifyCnicSchema,
} from './auth.types';

const router = Router();

/**
 * @route   POST /api/auth/register/user
 * @desc    Register a new traveler
 * @access  Public
 */
router.post(
  '/register/user',
  validateBody(userRegisterSchema.shape.body),
  authController.registerUser.bind(authController)
);

/**
 * @route   POST /api/auth/register/agency
 * @desc    Register a new travel agency with KYC documents
 * @access  Public
 * @note    Accepts multipart/form-data with cnicImage and ownerPhoto files
 */
router.post(
  '/register/agency',
  uploadKycDocuments as any,
  validateBody(agencyRegisterSchema.shape.body),
  authController.registerAgency.bind(authController)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user, agency, or admin
 * @access  Public
 * @note    Client should authenticate with Firebase first, then call this endpoint
 */
router.post(
  '/login',
  validateBody(loginSchema.shape.body),
  authController.login.bind(authController)
);

/**
 * @route   POST /api/auth/verify-cnic
 * @desc    Verify CNIC for a traveler
 * @access  Private (Traveler only)
 */
router.post(
  '/verify-cnic',
  authenticate,
  validateBody(verifyCnicSchema.shape.body),
  authController.verifyCnic.bind(authController)
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  authController.getProfile.bind(authController)
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh authentication token
 * @access  Public
 */
router.post(
  '/refresh',
  authController.refreshToken.bind(authController)
);

export default router;
