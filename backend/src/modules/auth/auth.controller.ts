import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response.util';

/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */
export class AuthController {
  /**
   * Register a new traveler
   * POST /api/auth/register/user
   * 
   * @example
   * Request body:
   * {
   *   "email": "user@example.com",
   *   "password": "password123",
   *   "name": "John Doe",
   *   "phone": "+1234567890",
   *   "cnic": "1234567890123"
   * }
   */
  async registerUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await authService.registerUser(req.body);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        sendError(res, 'Email already registered', 409);
      } else {
        sendError(res, error.message || 'Registration failed', 400);
      }
    }
  }

  /**
   * Register a new travel agency
   * POST /api/auth/register/agency
   * 
   * @example
   * Request body:
   * {
   *   "email": "agency@example.com",
   *   "password": "password123",
   *   "name": "Travel Agency Inc",
   *   "phone": "+1234567890",
   *   "address": "123 Main St",
   *   "license": "TA-12345"
   * }
   */
  async registerAgency(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await authService.registerAgency(req.body);
      sendSuccess(
        res,
        result,
        'Agency registered successfully. Pending admin approval.',
        201
      );
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        sendError(res, 'Email already registered', 409);
      } else {
        sendError(res, error.message || 'Registration failed', 400);
      }
    }
  }

  /**
   * Login user, agency, or admin
   * POST /api/auth/login
   * 
   * Option 1: Send Firebase token (recommended)
   * Request body: { "firebaseToken": "firebase_id_token" }
   * 
   * Option 2: Send email/password (legacy, for testing)
   * Request body: { "email": "user@example.com", "password": "password123" }
   * 
   * @example
   * Request body (with Firebase token):
   * {
   *   "firebaseToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   */
  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      // If Firebase token is provided, verify it
      if (req.body.firebaseToken) {
        const result = await authService.verifyFirebaseToken(req.body.firebaseToken);
        sendSuccess(res, result, 'Login successful');
        return;
      }

      // Otherwise, use email/password (for testing/development)
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      sendError(res, error.message || 'Login failed', 401);
    }
  }

  /**
   * Verify CNIC for a traveler
   * POST /api/auth/verify-cnic
   * Requires authentication
   * 
   * @example
   * Request body:
   * {
   *   "cnic": "1234567890123",
   *   "cnicImage": "https://storage.example.com/cnic-image.jpg"
   * }
   */
  async verifyCnic(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      // Get user ID from database using Firebase UID
      const profile = await authService.getProfile(req.user.uid);
      const result = await authService.verifyCnic(profile.id, req.body);
      sendSuccess(res, result, 'CNIC verification submitted');
    } catch (error: any) {
      sendError(res, error.message || 'CNIC verification failed', 400);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/profile
   * Requires authentication
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const profile = await authService.getProfile(req.user.uid);
      sendSuccess(res, profile, 'Profile retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get profile', 404);
    }
  }

  /**
   * Refresh token
   * POST /api/auth/refresh
   * 
   * @example
   * Request body:
   * {
   *   "refreshToken": "refresh_token_here"
   * }
   */
  async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      // TODO: Implement refresh token logic
      // For now, return error
      sendError(res, 'Refresh token not implemented yet', 501);
    } catch (error: any) {
      sendError(res, error.message || 'Token refresh failed', 400);
    }
  }
}

export const authController = new AuthController();
