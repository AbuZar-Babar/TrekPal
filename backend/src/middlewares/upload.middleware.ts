import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Upload Middleware
 * Configures multer for KYC document uploads (CNIC image + owner photo)
 */

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'kyc');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// File filter - only allow images
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
};

// Create multer instance
const upload = multer({
    storage,
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
