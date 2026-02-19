import { Response } from 'express';
import path from 'path';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { getErrorMessage } from '../../utils/error.util';
import { deleteKycFile, uploadKycFile } from '../../services/kyc-storage.service';

const inferExtensionFromMimeType = (mimeType: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return map[mimeType] || '.bin';
};

const buildKycObjectPath = (
  uploadBatchId: string,
  fieldName: string,
  file: Express.Multer.File
): string => {
  const originalExt = path.extname(file.originalname || '').toLowerCase();
  const extension = originalExt || inferExtensionFromMimeType(file.mimetype);
  return `agencies/pending/${uploadBatchId}/${fieldName}${extension}`;
};

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
   * Register a new travel agency with KYC documents
   * POST /api/auth/register/agency
   * Content-Type: multipart/form-data
   * 
   * @example
   * Form fields:
   *   email, password, name, phone, address, license, ownerName, cnic
   * Files:
   *   cnicImage (JPEG/PNG), ownerPhoto (JPEG/PNG)
   */
  async registerAgency(req: AuthRequest, res: Response): Promise<void> {
    const uploadedObjectPaths: string[] = [];
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const uploadBatchId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

      let cnicImageUrl: string | undefined;
      let ownerPhotoUrl: string | undefined;

      if (files?.cnicImage?.[0]) {
        const cnicImage = files.cnicImage[0];
        const objectPath = buildKycObjectPath(uploadBatchId, 'cnicImage', cnicImage);
        await uploadKycFile(cnicImage.buffer, cnicImage.mimetype, objectPath);
        uploadedObjectPaths.push(objectPath);
        cnicImageUrl = objectPath;
      }
      if (files?.ownerPhoto?.[0]) {
        const ownerPhoto = files.ownerPhoto[0];
        const objectPath = buildKycObjectPath(uploadBatchId, 'ownerPhoto', ownerPhoto);
        await uploadKycFile(ownerPhoto.buffer, ownerPhoto.mimetype, objectPath);
        uploadedObjectPaths.push(objectPath);
        ownerPhotoUrl = objectPath;
      }

      const result = await authService.registerAgency({
        ...req.body,
        cnicImageUrl,
        ownerPhotoUrl,
      });

      sendSuccess(
        res,
        result,
        'Agency registered successfully. Pending admin approval.',
        201
      );
    } catch (error: any) {
      if (uploadedObjectPaths.length > 0) {
        const cleanupResults = await Promise.allSettled(
          uploadedObjectPaths.map((objectPath) => deleteKycFile(objectPath))
        );
        const failedCleanupCount = cleanupResults.filter((result) => result.status === 'rejected').length;
        if (failedCleanupCount > 0) {
          console.error(`[Auth Controller] Failed to cleanup ${failedCleanupCount} uploaded KYC object(s)`);
        }
      }

      console.error('[Auth Controller] registerAgency error:', error.message || error);
      if (error.code === 'auth/email-already-exists') {
        sendError(res, 'Email already registered', 409);
      } else if (error.code === 'P2002') {
        // Prisma unique constraint violation
        const field = error.meta?.target?.[0] || 'field';
        sendError(res, `A record with this ${field} already exists`, 409);
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
    } catch (error: unknown) {
      sendError(res, getErrorMessage(error) || 'Login failed', 401);
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
    } catch (error: unknown) {
      sendError(res, getErrorMessage(error) || 'CNIC verification failed', 400);
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
    } catch (error: unknown) {
      sendError(res, getErrorMessage(error) || 'Failed to get profile', 404);
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
    } catch (error: unknown) {
      sendError(res, getErrorMessage(error) || 'Token refresh failed', 400);
    }
  }
}

export const authController = new AuthController();
