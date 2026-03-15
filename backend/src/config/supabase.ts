import { createClient, SupabaseClient, type User as SupabaseUser } from '@supabase/supabase-js';
import { env } from './env';

let supabaseAdminClient: SupabaseClient | null = null;

export interface CreateSupabaseAuthUserInput {
  email: string;
  password: string;
  name?: string;
  role: string;
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
};

/**
 * Supabase service-role client for server-side operations
 * (private bucket uploads, signed URL generation, object deletion).
 */
export const getSupabaseAdminClient = (): SupabaseClient => {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
  }

  supabaseAdminClient = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminClient;
};

const isDuplicateUserError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const message = String((error as { message?: string }).message || '').toLowerCase();
  return (
    message.includes('already') ||
    message.includes('exists') ||
    message.includes('registered') ||
    message.includes('duplicate')
  );
};

export const createSupabaseAuthUser = async (
  input: CreateSupabaseAuthUserInput
): Promise<SupabaseUser> => {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: input.name ? { name: input.name } : undefined,
    app_metadata: { role: input.role },
  });

  if (error || !data.user) {
    if (error && isDuplicateUserError(error)) {
      const duplicateError = new Error('Email already registered') as Error & { code?: string };
      duplicateError.code = 'auth/email-already-exists';
      throw duplicateError;
    }
    throw error || new Error('Failed to create Supabase auth user');
  }

  return data.user;
};

export interface SupabasePasswordSignInResult {
  user: SupabaseUser;
  accessToken: string;
}

const createIsolatedSupabaseClient = (): SupabaseClient => {
  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
  }

  return createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const signInWithSupabasePassword = async (
  email: string,
  password: string
): Promise<SupabasePasswordSignInResult> => {
  // IMPORTANT: never sign in on the shared admin client.
  // signInWithPassword sets session state on the client instance and can
  // downgrade subsequent storage/admin calls to user-level RLS permissions.
  const supabase = createIsolatedSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user || !data.session?.access_token) {
    throw error || new Error('Invalid email or password');
  }

  return {
    user: data.user,
    accessToken: data.session.access_token,
  };
};

export const verifySupabaseAccessToken = async (accessToken: string): Promise<SupabaseUser> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw error || new Error('Invalid Supabase access token');
  }

  return data.user;
};
