import { type User as SupabaseUser } from '@supabase/supabase-js';
import {
  ROLES,
  APPROVAL_STATUS,
  normalizeTravelerKycStatus,
} from '../../config/constants';
import {
  createSupabaseAuthUser,
  isSupabaseConfigured,
  signInWithSupabasePassword,
  verifySupabaseAccessToken,
} from '../../config/supabase';
import { generateJWT } from '../../utils/jwt.util';
import {
  UserRegisterInput,
  AgencyRegisterInput,
  LoginInput,
  VerifyCnicInput,
  AuthResponse,
} from './auth.types';
import {
  IUserRepository,
  IAgencyRepository,
  IAdminRepository,
  PrismaUserRepository,
  PrismaAgencyRepository,
  PrismaAdminRepository,
} from '../../repositories';

/**
 * Auth Service
 * Handles authentication business logic using repository pattern
 */
export class AuthService {
  private userRepo: IUserRepository;
  private agencyRepo: IAgencyRepository;
  private adminRepo: IAdminRepository;

  constructor(
    userRepo?: IUserRepository,
    agencyRepo?: IAgencyRepository,
    adminRepo?: IAdminRepository
  ) {
    this.userRepo = userRepo || new PrismaUserRepository();
    this.agencyRepo = agencyRepo || new PrismaAgencyRepository();
    this.adminRepo = adminRepo || new PrismaAdminRepository();
  }

  private normalizeRole(role: unknown): string {
    if (typeof role !== 'string') {
      return ROLES.TRAVELER;
    }

    const normalizedRole = role.toUpperCase();
    if (normalizedRole === ROLES.TRAVELER || normalizedRole === ROLES.AGENCY || normalizedRole === ROLES.ADMIN) {
      return normalizedRole;
    }

    return ROLES.TRAVELER;
  }

  private getRoleFromSupabaseUser(user: SupabaseUser): string {
    return this.normalizeRole(user.app_metadata?.role ?? user.user_metadata?.role);
  }

  private buildToken(user: AuthResponse['user']): string {
    return generateJWT({
      uid: user.authUid,
      email: user.email,
      role: user.role,
    });
  }

  private mapTraveler(user: {
    id: string;
    authUid: string;
    email: string;
    name: string | null;
    phone?: string | null;
    cnic?: string | null;
    cnicVerified?: boolean;
    travelerKycStatus?: string;
    dateOfBirth?: Date | null;
    city?: string | null;
    residentialAddress?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    kycSubmittedAt?: Date | null;
    kycVerifiedAt?: Date | null;
  }): AuthResponse['user'] {
    return {
      id: user.id,
      authUid: user.authUid,
      email: user.email,
      name: user.name,
      phone: user.phone ?? null,
      cnic: user.cnic ?? null,
      cnicVerified: user.cnicVerified ?? false,
      travelerKycStatus: normalizeTravelerKycStatus(user.travelerKycStatus),
      dateOfBirth: user.dateOfBirth ?? null,
      city: user.city ?? null,
      residentialAddress: user.residentialAddress ?? null,
      emergencyContactName: user.emergencyContactName ?? null,
      emergencyContactPhone: user.emergencyContactPhone ?? null,
      kycSubmittedAt: user.kycSubmittedAt ?? null,
      kycVerifiedAt: user.kycVerifiedAt ?? null,
      role: ROLES.TRAVELER,
    };
  }

  private mapAgency(agency: {
    id: string;
    authUid: string;
    email: string;
    name: string;
    status?: string;
  }): AuthResponse['user'] {
    return {
      id: agency.id,
      authUid: agency.authUid,
      email: agency.email,
      name: agency.name,
      status: agency.status,
      role: ROLES.AGENCY,
    };
  }

  private mapAdmin(admin: { id: string; authUid: string; email: string; name: string }): AuthResponse['user'] {
    return {
      id: admin.id,
      authUid: admin.authUid,
      email: admin.email,
      name: admin.name,
      role: ROLES.ADMIN,
    };
  }

  private getAgencyApprovalErrorMessage(status: string): string {
    if (status === APPROVAL_STATUS.REJECTED) {
      return 'Agency account was rejected';
    }

    return 'Agency account is pending approval';
  }

  private assertAgencyApproved(agency: { status: string }): void {
    if (agency.status !== APPROVAL_STATUS.APPROVED) {
      throw new Error(this.getAgencyApprovalErrorMessage(agency.status));
    }
  }

  private async findProfileByEmail(email: string, enforceAgencyApproval: boolean): Promise<AuthResponse['user'] | null> {
    const traveler = await this.userRepo.findByEmail(email);
    if (traveler) {
      return this.mapTraveler(traveler);
    }

    const agency = await this.agencyRepo.findByEmail(email);
    if (agency) {
      if (enforceAgencyApproval && agency.status !== APPROVAL_STATUS.APPROVED) {
        throw new Error(this.getAgencyApprovalErrorMessage(agency.status));
      }
      return this.mapAgency(agency);
    }

    const admin = await this.adminRepo.findByEmail(email);
    if (admin) {
      return this.mapAdmin(admin);
    }

    return null;
  }

  private async syncAuthUidForEmail(email: string, authUid: string): Promise<AuthResponse['user'] | null> {
    const traveler = await this.userRepo.findByEmail(email);
    if (traveler) {
      const updatedTraveler = traveler.authUid === authUid
        ? traveler
        : await this.userRepo.update(traveler.id, { authUid });
      return this.mapTraveler(updatedTraveler);
    }

    const agency = await this.agencyRepo.findByEmail(email);
    if (agency) {
      const updatedAgency = agency.authUid === authUid
        ? agency
        : await this.agencyRepo.update(agency.id, { authUid });
      this.assertAgencyApproved(updatedAgency);
      return this.mapAgency(updatedAgency);
    }

    const admin = await this.adminRepo.findByEmail(email);
    if (admin) {
      const updatedAdmin = admin.authUid === authUid
        ? admin
        : await this.adminRepo.update(admin.id, { authUid });
      return this.mapAdmin(updatedAdmin);
    }

    return null;
  }

  private buildDevelopmentAuthUid(): string {
    return `dev-auth-uid-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Register a new traveler (user)
   */
  async registerUser(input: UserRegisterInput): Promise<AuthResponse> {
    let authUid: string;

    if (isSupabaseConfigured()) {
      const supabaseUser = await createSupabaseAuthUser({
        email: input.email,
        password: input.password,
        name: input.name,
        role: ROLES.TRAVELER,
      });
      authUid = supabaseUser.id;
    } else if (process.env.NODE_ENV === 'development') {
      authUid = this.buildDevelopmentAuthUid();
      console.warn('Supabase auth is not configured, using development mode UID');
    } else {
      throw new Error('Supabase auth is not configured');
    }

    const user = await this.userRepo.create({
      authUid,
      email: input.email,
      name: input.name,
      phone: input.phone,
      cnic: input.cnic,
      cnicVerified: false,
    });
    const profile = this.mapTraveler(user);

    return {
      user: profile,
      token: this.buildToken(profile),
    };
  }

  /**
   * Register a new travel agency
   */
  async registerAgency(input: AgencyRegisterInput): Promise<AuthResponse> {
    let authUid: string;

    if (isSupabaseConfigured()) {
      const supabaseUser = await createSupabaseAuthUser({
        email: input.email,
        password: input.password,
        name: input.name,
        role: ROLES.AGENCY,
      });
      authUid = supabaseUser.id;
    } else if (process.env.NODE_ENV === 'development') {
      authUid = this.buildDevelopmentAuthUid();
      console.warn('Supabase auth is not configured, using development mode UID');
    } else {
      throw new Error('Supabase auth is not configured');
    }

    const agency = await this.agencyRepo.create({
      authUid,
      email: input.email,
      name: input.name,
      phone: input.phone,
      address: input.address,
      officeCity: input.officeCity,
      jurisdiction: input.jurisdiction,
      legalEntityType: input.legalEntityType,
      license: input.license,
      ntn: input.ntn,
      secpRegistrationNumber: input.secpRegistrationNumber,
      partnershipRegistrationNumber: input.partnershipRegistrationNumber,
      fieldOfOperations: input.fieldOfOperations,
      capitalAvailablePkr: input.capitalAvailablePkr,
      ownerName: input.ownerName,
      cnic: input.cnic,
      cnicImageUrl: input.cnicImageUrl,
      ownerPhotoUrl: input.ownerPhotoUrl,
      licenseCertificateUrl: input.licenseCertificateUrl,
      ntnCertificateUrl: input.ntnCertificateUrl,
      businessRegistrationProofUrl: input.businessRegistrationProofUrl,
      officeProofUrl: input.officeProofUrl,
      bankCertificateUrl: input.bankCertificateUrl,
      additionalSupportingDocumentUrl: input.additionalSupportingDocumentUrl,
      applicationSubmittedAt: new Date(),
      status: APPROVAL_STATUS.PENDING,
    });
    const profile = this.mapAgency(agency);

    return {
      user: profile,
      token: this.buildToken(profile),
    };
  }

  /**
   * Login user, agency, or admin using Supabase email/password
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    if (!input.email || !input.password) {
      throw new Error('Email and password are required');
    }

    if (!isSupabaseConfigured()) {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('Supabase auth is not configured');
      }

      const developmentProfile = await this.findProfileByEmail(input.email, true);
      if (!developmentProfile) {
        throw new Error('Invalid credentials');
      }

      return {
        user: developmentProfile,
        token: this.buildToken(developmentProfile),
      };
    }

    let supabaseUser: SupabaseUser;
    try {
      const result = await signInWithSupabasePassword(input.email, input.password);
      supabaseUser = result.user;
    } catch {
      throw new Error('Invalid credentials');
    }

    let profile: AuthResponse['user'] | null = null;
    try {
      profile = await this.getProfile(supabaseUser.id);
    } catch {
      profile = null;
    }

    const profileEmail = supabaseUser.email || input.email;
    if (!profile) {
      profile = await this.syncAuthUidForEmail(profileEmail, supabaseUser.id);
    }
    if (!profile) {
      throw new Error('User not found');
    }

    profile.role = this.normalizeRole(profile.role || this.getRoleFromSupabaseUser(supabaseUser));

    return {
      user: profile,
      token: this.buildToken(profile),
    };
  }

  /**
   * Verify CNIC for a traveler
   */
  async verifyCnic(userId: string, input: VerifyCnicInput): Promise<{ cnicVerified: boolean }> {
    const user = await this.userRepo.update(userId, {
      cnic: input.cnic,
      cnicVerified: true,
    });

    return {
      cnicVerified: user.cnicVerified,
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(authUid: string): Promise<AuthResponse['user']> {
    const user = await this.userRepo.findByAuthUid(authUid);
    if (user) {
      return this.mapTraveler(user);
    }

    const agency = await this.agencyRepo.findByAuthUid(authUid);
    if (agency) {
      this.assertAgencyApproved(agency);
      return this.mapAgency(agency);
    }

    const admin = await this.adminRepo.findByAuthUid(authUid);
    if (admin) {
      return this.mapAdmin(admin);
    }

    throw new Error('User not found');
  }

  /**
   * Verify Supabase token and return app JWT + profile
   */
  async verifySupabaseToken(supabaseToken: string): Promise<AuthResponse> {
    let supabaseUser: SupabaseUser;

    if (isSupabaseConfigured()) {
      supabaseUser = await verifySupabaseAccessToken(supabaseToken);
    } else if (process.env.NODE_ENV === 'development') {
      supabaseUser = {
        id: `dev-uid-${supabaseToken.substring(0, 10)}`,
        email: 'dev@example.com',
        app_metadata: { role: ROLES.TRAVELER },
        user_metadata: {},
      } as unknown as SupabaseUser;
    } else {
      throw new Error('Supabase auth is not configured');
    }

    let profile: AuthResponse['user'] | null = null;
    try {
      profile = await this.getProfile(supabaseUser.id);
    } catch {
      profile = null;
    }

    if (!profile && supabaseUser.email) {
      profile = await this.syncAuthUidForEmail(supabaseUser.email, supabaseUser.id);
    }

    if (!profile) {
      throw new Error('User not found');
    }

    profile.role = this.normalizeRole(profile.role || this.getRoleFromSupabaseUser(supabaseUser));

    return {
      user: profile,
      token: this.buildToken(profile),
    };
  }
}

export const authService = new AuthService();
