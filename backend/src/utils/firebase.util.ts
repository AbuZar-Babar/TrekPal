import { getFirebaseAuth } from '../config/firebase';

/**
 * Firebase utility functions
 */

/**
 * Get user by UID
 */
export const getUserByUid = async (uid: string) => {
  const auth = getFirebaseAuth();
  return await auth.getUser(uid);
};

/**
 * Create custom token for user
 */
export const createCustomToken = async (uid: string, additionalClaims?: object) => {
  const auth = getFirebaseAuth();
  return await auth.createCustomToken(uid, additionalClaims);
};

/**
 * Set custom user claims (roles, permissions)
 */
export const setCustomClaims = async (uid: string, claims: object) => {
  try {
    const auth = getFirebaseAuth();
    return await auth.setCustomUserClaims(uid, claims);
  } catch (error) {
    // In development, if Firebase is not configured, skip setting claims
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Firebase not configured, skipping custom claims');
      return;
    }
    throw error;
  }
};

