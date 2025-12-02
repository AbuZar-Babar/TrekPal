import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

/**
 * Firebase Admin SDK initialization
 * TODO: Add your Firebase service account credentials
 */
let firebaseApp: App | null = null;
let firebaseAuth: Auth | null = null;
let firebaseStorage: Storage | null = null;

export const initializeFirebase = (): void => {
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    // In development, skip Firebase initialization if credentials are missing or invalid
    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Firebase credentials are required in production. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables.');
      }
      console.warn('⚠️  Firebase credentials not configured. Firebase features will be disabled in development mode.');
      return;
    }

    // Validate private key format (basic check)
    if (!serviceAccount.privateKey.includes('BEGIN PRIVATE KEY') || !serviceAccount.privateKey.includes('END PRIVATE KEY')) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid Firebase private key format.');
      }
      console.warn('⚠️  Invalid Firebase private key format. Firebase features will be disabled in development mode.');
      return;
    }

    try {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount as any),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      console.warn('⚠️  Failed to initialize Firebase. Firebase features will be disabled in development mode.');
      console.warn('   Error:', (error as Error).message);
      return;
    }
  } else {
    firebaseApp = getApps()[0];
  }

  if (firebaseApp) {
    firebaseAuth = getAuth(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
  }
};

export const getFirebaseAuth = (): Auth => {
  if (!firebaseAuth) {
    initializeFirebase();
    if (!firebaseAuth) {
      throw new Error('Firebase Auth is not initialized. Please configure Firebase credentials.');
    }
    return firebaseAuth;
  }
  return firebaseAuth;
};

export const getFirebaseStorage = (): Storage => {
  if (!firebaseStorage) {
    initializeFirebase();
    if (!firebaseStorage) {
      throw new Error('Firebase Storage is not initialized. Please configure Firebase credentials.');
    }
    return firebaseStorage;
  }
  return firebaseStorage;
};

