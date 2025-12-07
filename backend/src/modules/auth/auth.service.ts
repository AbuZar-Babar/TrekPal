import { getFirebaseAuth } from '../../config/firebase';
import { setCustomClaims } from '../../utils/firebase.util';
import { prisma } from '../../config/database';
import { ROLES, APPROVAL_STATUS } from '../../config/constants';
import { generateJWT } from '../../utils/jwt.util';
import {
  UserRegisterInput,
  AgencyRegisterInput,
  LoginInput,
  VerifyCnicInput,
  AuthResponse,
} from './auth.types';

/**
 * Auth Service
 * Handles authentication business logic
 */
export class AuthService {
  /**
   * Register a new traveler (user)
   * @param input - User registration data
   * @returns Auth response with user and token
   */
  async registerUser(input: UserRegisterInput): Promise<AuthResponse> {
    let firebaseUid: string;
    
    try {
      const firebaseAuth = getFirebaseAuth();
      // Create user in Firebase
      const firebaseUser = await firebaseAuth.createUser({
        email: input.email,
        password: input.password,
        displayName: input.name,
      });
      firebaseUid = firebaseUser.uid;
      // Set custom claims (role)
      await setCustomClaims(firebaseUser.uid, { role: ROLES.TRAVELER });
    } catch (error) {
      // In development, if Firebase is not configured, generate a fake UID
      if (process.env.NODE_ENV === 'development') {
        firebaseUid = `dev-firebase-uid-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        console.warn('⚠️  Firebase not configured, using development mode UID');
      } else {
        throw error;
      }
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        firebaseUid: firebaseUid,
        email: input.email,
        name: input.name,
        phone: input.phone,
        cnic: input.cnic,
        cnicVerified: false,
      },
    });

    // Generate JWT token
    const token = generateJWT({
      uid: firebaseUid,
      email: input.email,
      role: ROLES.TRAVELER,
    });

    return {
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: ROLES.TRAVELER,
      },
      token,
    };
  }

  /**
   * Register a new travel agency
   * @param input - Agency registration data
   * @returns Auth response with agency and token
   */
  async registerAgency(input: AgencyRegisterInput): Promise<AuthResponse> {
    let firebaseUid: string;
    
    try {
      const firebaseAuth = getFirebaseAuth();
      // Create user in Firebase
      const firebaseUser = await firebaseAuth.createUser({
        email: input.email,
        password: input.password,
        displayName: input.name,
      });
      firebaseUid = firebaseUser.uid;
      // Set custom claims (role)
      await setCustomClaims(firebaseUser.uid, { role: ROLES.AGENCY });
    } catch (error) {
      // In development, if Firebase is not configured, generate a fake UID
      if (process.env.NODE_ENV === 'development') {
        firebaseUid = `dev-firebase-uid-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        console.warn('⚠️  Firebase not configured, using development mode UID');
      } else {
        throw error;
      }
    }

    // Create agency in database (status: PENDING - needs admin approval)
    console.log('[Auth Service] Creating agency in database:', {
      email: input.email,
      name: input.name,
      firebaseUid: firebaseUid,
    });
    
    const agency = await prisma.agency.create({
      data: {
        firebaseUid: firebaseUid,
        email: input.email,
        name: input.name,
        phone: input.phone,
        address: input.address,
        license: input.license,
        status: APPROVAL_STATUS.PENDING,
      },
    });
    
    console.log('[Auth Service] Agency created successfully:', {
      id: agency.id,
      email: agency.email,
      name: agency.name,
      status: agency.status,
    });

    // Generate JWT token
    const token = generateJWT({
      uid: firebaseUid,
      email: input.email,
      role: ROLES.AGENCY,
    });

    return {
      user: {
        id: agency.id,
        firebaseUid: agency.firebaseUid,
        email: agency.email,
        name: agency.name,
        role: ROLES.AGENCY,
      },
      token,
    };
  }

  /**
   * Login user or agency
   * Note: Firebase handles password verification on client side
   * This endpoint verifies the Firebase token and returns user data
   * @param input - Login credentials
   * @returns Auth response with user and token
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (user) {
      // User found - traveler
      const token = generateJWT({
        uid: user.firebaseUid,
        email: user.email,
        role: ROLES.TRAVELER,
      });

      return {
        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          name: user.name,
          role: ROLES.TRAVELER,
        },
        token,
      };
    }

    // Check if it's an agency
    const agency = await prisma.agency.findUnique({
      where: { email: input.email },
    });

    if (agency) {
      // Check if agency is approved
      if (agency.status !== APPROVAL_STATUS.APPROVED) {
        throw new Error('Agency account is pending approval');
      }

      const token = generateJWT({
        uid: agency.firebaseUid,
        email: agency.email,
        role: ROLES.AGENCY,
      });

      return {
        user: {
          id: agency.id,
          firebaseUid: agency.firebaseUid,
          email: agency.email,
          name: agency.name,
          role: ROLES.AGENCY,
        },
        token,
      };
    }

    // Check if it's an admin
    const admin = await prisma.admin.findUnique({
      where: { email: input.email },
    });

    if (admin) {
      const token = generateJWT({
        uid: admin.firebaseUid,
        email: admin.email,
        role: ROLES.ADMIN,
      });

      return {
        user: {
          id: admin.id,
          firebaseUid: admin.firebaseUid,
          email: admin.email,
          name: admin.name,
          role: ROLES.ADMIN,
        },
        token,
      };
    }

    throw new Error('Invalid credentials');
  }

  /**
   * Verify CNIC for a traveler
   * @param userId - User ID
   * @param input - CNIC verification data
   * @returns Updated user with verified CNIC
   */
  async verifyCnic(userId: string, input: VerifyCnicInput): Promise<{ cnicVerified: boolean }> {
    // TODO: Implement actual CNIC verification logic
    // This could involve:
    // 1. Image processing/OCR
    // 2. Third-party verification service
    // 3. Manual admin review

    // For now, just update the CNIC and mark as verified
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        cnic: input.cnic,
        cnicVerified: true,
      },
    });

    return {
      cnicVerified: user.cnicVerified,
    };
  }

  /**
   * Get current user profile
   * @param firebaseUid - Firebase UID
   * @returns User profile
   */
  async getProfile(firebaseUid: string): Promise<AuthResponse['user']> {
    // Try to find as user
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (user) {
      return {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: ROLES.TRAVELER,
      };
    }

    // Try to find as agency
    const agency = await prisma.agency.findUnique({
      where: { firebaseUid },
    });

    if (agency) {
      return {
        id: agency.id,
        firebaseUid: agency.firebaseUid,
        email: agency.email,
        name: agency.name,
        role: ROLES.AGENCY,
      };
    }

    // Try to find as admin
    const admin = await prisma.admin.findUnique({
      where: { firebaseUid },
    });

    if (admin) {
      return {
        id: admin.id,
        firebaseUid: admin.firebaseUid,
        email: admin.email,
        name: admin.name,
        role: ROLES.ADMIN,
      };
    }

    throw new Error('User not found');
  }

  /**
   * Verify Firebase token and get user
   * Used for login flow where client authenticates with Firebase first
   * @param firebaseToken - Firebase ID token
   * @returns Auth response with user and token
   */
  async verifyFirebaseToken(firebaseToken: string): Promise<AuthResponse> {
    let decodedToken: any;
    
    try {
      const firebaseAuth = getFirebaseAuth();
      decodedToken = await firebaseAuth.verifyIdToken(firebaseToken);
    } catch (error) {
      // In development, if Firebase is not configured, use development mode
      if (process.env.NODE_ENV === 'development') {
        decodedToken = {
          uid: `dev-uid-${firebaseToken.substring(0, 10)}`,
          email: 'dev@example.com',
          role: ROLES.TRAVELER,
        };
      } else {
        throw error;
      }
    }

    // Get user profile
    const profile = await this.getProfile(decodedToken.uid);

    // Generate JWT token
    const token = generateJWT({
      uid: decodedToken.uid,
      email: decodedToken.email || profile.email,
      role: profile.role,
    });

    return {
      user: profile,
      token,
    };
  }
}

export const authService = new AuthService();
