import multer from 'multer';
import { Request } from 'express';

/**
 * Upload Middleware
 * Configures multer for KYC document uploads (CNIC image + owner photo)
 */

// File filter - only allow images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
};

// Create multer instance
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max per file
    },
});

/**
 * Middleware for KYC document upload
 * Expects two files: 'cnicImage' and 'ownerPhoto'
 */
export const uploadKycDocuments = upload.fields([
    { name: 'cnicImage', maxCount: 1 },
    { name: 'ownerPhoto', maxCount: 1 },
]);
