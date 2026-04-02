import path from 'path';
import { env } from '../config/env';
import { getSupabaseAdminClient } from '../config/supabase';
import { inferKycExtensionFromMimeType, resolveKycMimeType } from '../utils/kyc-file.util';
import { isHttpUrl } from './kyc-storage.service';

const getMediaBucket = (): string => env.SUPABASE_STORAGE_BUCKET_MEDIA || env.SUPABASE_STORAGE_BUCKET_KYC;

const extractStorageObjectPath = (value: string, bucket: string): string | null => {
  try {
    const parsedUrl = new URL(value);
    const pathname = parsedUrl.pathname;
    const markers = [
      `/storage/v1/object/sign/${bucket}/`,
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/authenticated/${bucket}/`,
    ];

    for (const marker of markers) {
      const markerIndex = pathname.indexOf(marker);
      if (markerIndex !== -1) {
        return decodeURIComponent(pathname.slice(markerIndex + marker.length));
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const normalizeMediaStoragePath = (value: string): string => {
  if (!isHttpUrl(value)) {
    return value;
  }

  const bucket = getMediaBucket();
  return extractStorageObjectPath(value, bucket) || value;
};

export const normalizeMediaStoragePaths = (values: string[] = []): string[] => {
  return values.map(normalizeMediaStoragePath);
};

export const buildMediaObjectPath = (
  directoryName: string,
  fileNameSeed: string,
  mimeType?: string | null,
  originalName?: string | null,
): string => {
  const originalExtension = path.extname(originalName ?? '').toLowerCase();
  const extension = originalExtension || inferKycExtensionFromMimeType(mimeType);
  return `${directoryName}/${fileNameSeed}${extension}`;
};

export const uploadMediaFile = async (
  buffer: Buffer,
  mimeType: string,
  objectPath: string,
): Promise<string> => {
  const supabase = getSupabaseAdminClient();
  const resolvedMimeType = resolveKycMimeType(mimeType, objectPath);
  const { error } = await supabase.storage.from(getMediaBucket()).upload(objectPath, buffer, {
    contentType: resolvedMimeType,
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    throw new Error(`Failed to upload media file: ${error.message}`);
  }

  return objectPath;
};

export const createSignedMediaUrl = async (
  value: string,
  ttlSeconds: number = env.SUPABASE_SIGNED_URL_TTL_SECONDS,
): Promise<string> => {
  if (!value) {
    throw new Error('Media path is required');
  }

  const normalizedValue = normalizeMediaStoragePath(value);
  if (isHttpUrl(normalizedValue)) {
    return normalizedValue;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(getMediaBucket())
    .createSignedUrl(normalizedValue, ttlSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed media URL: ${error?.message || 'unknown error'}`);
  }

  return data.signedUrl;
};

export const resolveMediaUrls = async (values: string[] = []): Promise<string[]> => {
  return Promise.all(values.map((value) => createSignedMediaUrl(value)));
};
