import multer from 'multer';
import {
  isAllowedKycFile,
  resolveKycMimeType,
} from '../utils/kyc-file.util';

/**
 * Upload Middleware
 * Configures multer for agency application uploads
 */

// File filter - allow images and PDFs for agency application documents
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
    if (isAllowedKycFile(file)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, JPEG, PNG, and WebP files are allowed'));
    }
};

// Create multer instance
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max per file
    },
});

/**
 * Middleware for agency application upload
 */
export const uploadKycDocuments = upload.fields([
    { name: 'cnicImage', maxCount: 1 },
    { name: 'ownerPhoto', maxCount: 1 },
    { name: 'licenseCertificate', maxCount: 1 },
    { name: 'ntnCertificate', maxCount: 1 },
    { name: 'businessRegistrationProof', maxCount: 1 },
    { name: 'officeProof', maxCount: 1 },
    { name: 'bankCertificate', maxCount: 1 },
    { name: 'additionalSupportingDocument', maxCount: 1 },
]);

/**
 * Middleware for traveler KYC upload
 */
export const uploadTravelerKycDocuments = upload.fields([
    { name: 'cnicFrontImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 },
]);

const ALLOWED_MEDIA_IMAGE_MIME_TYPES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const isAllowedMediaImage = (file: {
  mimetype?: string | null;
  originalname?: string | null;
}): boolean => {
  return ALLOWED_MEDIA_IMAGE_MIME_TYPES.has(
    resolveKycMimeType(file.mimetype, file.originalname),
  );
};

export const createMediaImageUpload = (_directoryName: string) =>
  multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, cb) => {
      if (isAllowedMediaImage(file)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, and WebP image files are allowed'));
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  }).single('image');
