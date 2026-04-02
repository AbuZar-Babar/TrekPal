import { Response } from 'express';
import path from 'path';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { getErrorMessage } from '../../utils/error.util';
import { deleteKycFile, uploadKycFile } from '../../services/kyc-storage.service';
import { AgencyRegisterInput } from './auth.types';
import {
  inferKycExtensionFromMimeType,
  resolveKycMimeType,
} from '../../utils/kyc-file.util';

type AgencyApplicationFileField =
  | 'cnicImage'
  | 'ownerPhoto'
  | 'licenseCertificate'
  | 'ntnCertificate'
  | 'businessRegistrationProof'
  | 'officeProof'
  | 'bankCertificate'
  | 'additionalSupportingDocument';

const agencyDocumentLabels: Record<AgencyApplicationFileField, string> = {
  cnicImage: 'CNIC image',
  ownerPhoto: 'owner photo',
  licenseCertificate: 'tourism license certificate',
  ntnCertificate: 'NTN certificate',
  businessRegistrationProof: 'business registration proof',
  officeProof: 'office ownership or rent proof',
  bankCertificate: 'bank certificate',
  additionalSupportingDocument: 'additional supporting document',
};

const agencyApplicationFileFields: AgencyApplicationFileField[] = [
  'cnicImage',
  'ownerPhoto',
  'licenseCertificate',
  'ntnCertificate',
  'businessRegistrationProof',
  'officeProof',
  'bankCertificate',
  'additionalSupportingDocument',
];

const requiredAgencyFileFields = (input: AgencyRegisterInput): AgencyApplicationFileField[] => {
  const required: AgencyApplicationFileField[] = [
    'cnicImage',
    'ownerPhoto',
    'licenseCertificate',
    'ntnCertificate',
    'officeProof',
    'bankCertificate',
  ];

  if (input.legalEntityType === 'COMPANY' || input.legalEntityType === 'PARTNERSHIP') {
    required.push('businessRegistrationProof');
  }

  return required;
};

const buildKycObjectPath = (
  uploadBatchId: string,
  fieldName: string,
  file: Express.Multer.File
): string => {
  const originalExt = path.extname(file.originalname || '').toLowerCase();
  const extension =
    originalExt || inferKycExtensionFromMimeType(file.mimetype);
  return `agencies/pending/${uploadBatchId}/${fieldName}${extension}`;
};

const getAuthErrorStatusCode = (message: string): number => {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('pending approval') || normalizedMessage.includes('was rejected')) {
    return 403;
  }

  if (normalizedMessage.includes('not found')) {
    return 404;
  }

  return 401;
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
   *   email, password, name, phone, address, officeCity, jurisdiction,
   *   legalEntityType, license, ntn, fieldOfOperations, capitalAvailablePkr,
   *   ownerName, cnic, secpRegistrationNumber?, partnershipRegistrationNumber?
   * Files:
   *   cnicImage, ownerPhoto, licenseCertificate, ntnCertificate,
   *   businessRegistrationProof?, officeProof, bankCertificate,
   *   additionalSupportingDocument?
   */
  async registerAgency(req: AuthRequest, res: Response): Promise<void> {
    const uploadedObjectPaths: string[] = [];
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const input = req.body as AgencyRegisterInput;
      const missingRequiredFiles = requiredAgencyFileFields(input).filter(
        (fieldName) => !files?.[fieldName]?.[0]
      );

      if (missingRequiredFiles.length > 0) {
        sendError(
          res,
          `Missing required documents: ${missingRequiredFiles.map((field) => agencyDocumentLabels[field]).join(', ')}`,
          400
        );
        return;
      }

      const uploadBatchId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const uploadedDocuments: Partial<Record<AgencyApplicationFileField, string>> = {};

      for (const fieldName of agencyApplicationFileFields) {
        const file = files?.[fieldName]?.[0];
        if (!file) {
          continue;
        }

        const objectPath = buildKycObjectPath(uploadBatchId, fieldName, file);
        await uploadKycFile(
          file.buffer,
          resolveKycMimeType(file.mimetype, file.originalname),
          objectPath,
        );
        uploadedObjectPaths.push(objectPath);
        uploadedDocuments[fieldName] = objectPath;
      }

      const result = await authService.registerAgency({
        ...input,
        cnicImageUrl: uploadedDocuments.cnicImage,
        ownerPhotoUrl: uploadedDocuments.ownerPhoto,
        licenseCertificateUrl: uploadedDocuments.licenseCertificate,
        ntnCertificateUrl: uploadedDocuments.ntnCertificate,
        businessRegistrationProofUrl: uploadedDocuments.businessRegistrationProof,
        officeProofUrl: uploadedDocuments.officeProof,
        bankCertificateUrl: uploadedDocuments.bankCertificate,
        additionalSupportingDocumentUrl: uploadedDocuments.additionalSupportingDocument,
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
   * Option 1: Send Supabase token
   * Request body: { "supabaseToken": "supabase_access_token" }
   * 
   * Option 2: Send email/password
   * Request body: { "email": "user@example.com", "password": "password123" }
   * 
   * @example
   * Request body (with Supabase token):
   * {
   *   "supabaseToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   */
  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      // If Supabase token is provided, verify it
      if (req.body.supabaseToken) {
        const result = await authService.verifySupabaseToken(req.body.supabaseToken);
        sendSuccess(res, result, 'Login successful');
        return;
      }

      // Otherwise, use email/password (for testing/development)
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (error: unknown) {
      const message = getErrorMessage(error) || 'Login failed';
      sendError(res, message, getAuthErrorStatusCode(message));
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

      // Get user ID from database using Auth UID
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
      const message = getErrorMessage(error) || 'Failed to get profile';
      sendError(res, message, getAuthErrorStatusCode(message));
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
  async refreshToken(_req: AuthRequest, res: Response): Promise<void> {
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
