import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let supabaseAdminClient: SupabaseClient | null = null;

/**
 * Supabase service-role client for server-side operations
 * (private bucket uploads, signed URL generation, object deletion).
 */
export const getSupabaseAdminClient = (): SupabaseClient => {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
  }

  supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminClient;
};
