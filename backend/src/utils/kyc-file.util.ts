import path from 'path';

const mimeTypeAliases: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/x-png': 'image/png',
  'application/x-pdf': 'application/pdf',
};

const extensionToMimeType: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

const mimeTypeToExtension: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export const ALLOWED_KYC_MIME_TYPES = new Set<string>(
  Object.values(extensionToMimeType),
);

export const normalizeKycMimeType = (
  mimeType?: string | null,
): string => {
  const normalized = mimeType?.trim().toLowerCase() ?? '';
  return mimeTypeAliases[normalized] ?? normalized;
};

export const inferKycMimeTypeFromFilename = (
  filename?: string | null,
): string | null => {
  const extension = path.extname(filename ?? '').toLowerCase();
  return extensionToMimeType[extension] ?? null;
};

export const inferKycExtensionFromMimeType = (
  mimeType?: string | null,
): string => {
  const normalizedMimeType = normalizeKycMimeType(mimeType);
  return mimeTypeToExtension[normalizedMimeType] ?? '.bin';
};

export const resolveKycMimeType = (
  mimeType?: string | null,
  filename?: string | null,
): string => {
  const normalizedMimeType = normalizeKycMimeType(mimeType);
  if (ALLOWED_KYC_MIME_TYPES.has(normalizedMimeType)) {
    return normalizedMimeType;
  }

  const inferredMimeType = inferKycMimeTypeFromFilename(filename);
  if (
    inferredMimeType &&
    (normalizedMimeType.length === 0 ||
      normalizedMimeType === 'application/octet-stream')
  ) {
    return inferredMimeType;
  }

  return normalizedMimeType || inferredMimeType || 'application/octet-stream';
};

export const isAllowedKycFile = (file: {
  mimetype?: string | null;
  originalname?: string | null;
}): boolean => {
  const normalizedMimeType = normalizeKycMimeType(file.mimetype);
  if (ALLOWED_KYC_MIME_TYPES.has(normalizedMimeType)) {
    return true;
  }

  if (
    normalizedMimeType.length === 0 ||
    normalizedMimeType === 'application/octet-stream'
  ) {
    return inferKycMimeTypeFromFilename(file.originalname) != null;
  }

  return false;
};
