import { env } from '../config/env';
import { getSupabaseAdminClient } from '../config/supabase';

export const isHttpUrl = (value: string | null | undefined): value is string => {
  if (!value) {
    return false;
  }
  return value.startsWith('http://') || value.startsWith('https://');
};

export const uploadKycFile = async (
  buffer: Buffer,
  mimeType: string,
  objectPath: string
): Promise<string> => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET_KYC).upload(objectPath, buffer, {
    contentType: mimeType || 'application/octet-stream',
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    throw new Error(`Failed to upload KYC file: ${error.message}`);
  }

  return objectPath;
};

export const createSignedKycUrl = async (
  objectPath: string,
  ttlSeconds: number = env.SUPABASE_SIGNED_URL_TTL_SECONDS
): Promise<string> => {
  if (!objectPath) {
    throw new Error('Object path is required');
  }

  if (isHttpUrl(objectPath)) {
    return objectPath;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET_KYC)
    .createSignedUrl(objectPath, ttlSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message || 'unknown error'}`);
  }

  return data.signedUrl;
};

export const deleteKycFile = async (objectPath: string): Promise<void> => {
  if (!objectPath || isHttpUrl(objectPath)) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET_KYC).remove([objectPath]);

  if (error) {
    throw new Error(`Failed to delete KYC file: ${error.message}`);
  }
};
