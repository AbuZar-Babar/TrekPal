import path from 'path';

import { type Prisma } from '@prisma/client';

import { prisma } from '../../config/database';
import { TRAVELER_KYC_STATUS } from '../../config/constants';
import {
  createSignedKycUrl,
  deleteKycFile,
  isHttpUrl,
  uploadKycFile,
} from '../../services/kyc-storage.service';
import {
  normalizeTravelerKycStatus,
  type SubmitTravelerKycInput,
  type UpdateProfileInput,
  type UserProfileResponse,
} from './users.types';

const inferExtensionFromMimeType = (mimeType: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
  };

  return map[mimeType] || '.bin';
};

const buildTravelerKycObjectPath = (
  userId: string,
  uploadBatchId: string,
  fieldName: 'cnicFrontImage' | 'selfieImage',
  file: Express.Multer.File,
): string => {
  const originalExt = path.extname(file.originalname || '').toLowerCase();
  const extension = originalExt || inferExtensionFromMimeType(file.mimetype);
  return `travelers/${userId}/${uploadBatchId}/${fieldName}${extension}`;
};

/**
 * Users Service
 * Handles user profile and traveler KYC business logic
 */
export class UsersService {
  private async resolveKycUrl(value: string | null): Promise<string | null> {
    if (!value) {
      return null;
    }

    if (isHttpUrl(value)) {
      return value;
    }

    try {
      return await createSignedKycUrl(value);
    } catch (error) {
      console.error('[Users Service] Failed to create signed KYC URL:', error);
      return null;
    }
  }

  private async mapUserProfile(user: {
    id: string;
    authUid: string;
    email: string;
    name: string | null;
    phone: string | null;
    cnic: string | null;
    cnicVerified: boolean;
    travelerKycStatus: string;
    dateOfBirth: Date | null;
    city: string | null;
    residentialAddress: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    cnicFrontImageUrl: string | null;
    selfieImageUrl: string | null;
    avatar: string | null;
    kycSubmittedAt: Date | null;
    kycVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<UserProfileResponse> {
    const [cnicFrontImageUrl, selfieImageUrl] = await Promise.all([
      this.resolveKycUrl(user.cnicFrontImageUrl),
      this.resolveKycUrl(user.selfieImageUrl),
    ]);

    return {
      id: user.id,
      authUid: user.authUid,
      email: user.email,
      name: user.name,
      phone: user.phone,
      cnic: user.cnic,
      cnicVerified: user.cnicVerified,
      travelerKycStatus: normalizeTravelerKycStatus(user.travelerKycStatus),
      dateOfBirth: user.dateOfBirth,
      city: user.city,
      residentialAddress: user.residentialAddress,
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
      cnicFrontImageUrl,
      selfieImageUrl,
      avatar: user.avatar,
      kycSubmittedAt: user.kycSubmittedAt,
      kycVerifiedAt: user.kycVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Get user profile by auth UID
   */
  async getProfile(authUid: string): Promise<UserProfileResponse> {
    const user = await prisma.user.findUnique({
      where: { authUid },
    });

    if (!user) {
      throw new Error('User profile not found');
    }

    return this.mapUserProfile(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    authUid: string,
    input: UpdateProfileInput,
  ): Promise<UserProfileResponse> {
    const existing = await prisma.user.findUnique({ where: { authUid } });
    if (!existing) {
      throw new Error('User profile not found');
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (input.name !== undefined) {
      updateData.name = input.name ?? null;
    }
    if (input.phone !== undefined) {
      updateData.phone = input.phone ?? null;
    }
    if (input.avatar !== undefined) {
      updateData.avatar = input.avatar ?? null;
    }

    const user = await prisma.user.update({
      where: { authUid },
      data: updateData,
    });

    return this.mapUserProfile(user);
  }

  /**
   * Submit traveler KYC documents and unlock traveler marketplace access.
   */
  async submitTravelerKyc(
    authUid: string,
    input: SubmitTravelerKycInput,
    files: {
      cnicFrontImage: Express.Multer.File;
      selfieImage: Express.Multer.File;
    },
  ): Promise<UserProfileResponse> {
    const existing = await prisma.user.findUnique({ where: { authUid } });
    if (!existing) {
      throw new Error('User profile not found');
    }

    const uploadBatchId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const uploadedObjectPaths: string[] = [];

    try {
      const cnicFrontImagePath = buildTravelerKycObjectPath(
        existing.id,
        uploadBatchId,
        'cnicFrontImage',
        files.cnicFrontImage,
      );
      await uploadKycFile(
        files.cnicFrontImage.buffer,
        files.cnicFrontImage.mimetype,
        cnicFrontImagePath,
      );
      uploadedObjectPaths.push(cnicFrontImagePath);

      const selfieImagePath = buildTravelerKycObjectPath(
        existing.id,
        uploadBatchId,
        'selfieImage',
        files.selfieImage,
      );
      await uploadKycFile(
        files.selfieImage.buffer,
        files.selfieImage.mimetype,
        selfieImagePath,
      );
      uploadedObjectPaths.push(selfieImagePath);

      const verificationTimestamp = new Date();
      const updatedUser = await prisma.user.update({
        where: { authUid },
        data: {
          cnic: input.cnic,
          cnicVerified: true,
          travelerKycStatus: TRAVELER_KYC_STATUS.VERIFIED,
          dateOfBirth: new Date(input.dateOfBirth),
          city: input.city,
          residentialAddress: input.residentialAddress,
          emergencyContactName: input.emergencyContactName,
          emergencyContactPhone: input.emergencyContactPhone,
          cnicFrontImageUrl: cnicFrontImagePath,
          selfieImageUrl: selfieImagePath,
          kycSubmittedAt: verificationTimestamp,
          kycVerifiedAt: verificationTimestamp,
        },
      });

      const staleObjectPaths = [
        existing.cnicFrontImageUrl,
        existing.selfieImageUrl,
      ]
        .filter((value): value is string => !!value)
        .filter((value) => !isHttpUrl(value))
        .filter(
          (value) =>
            value !== cnicFrontImagePath && value !== selfieImagePath,
        );

      if (staleObjectPaths.length > 0) {
        await Promise.allSettled(
          staleObjectPaths.map((objectPath) => deleteKycFile(objectPath)),
        );
      }

      return this.mapUserProfile(updatedUser);
    } catch (error) {
      if (uploadedObjectPaths.length > 0) {
        await Promise.allSettled(
          uploadedObjectPaths.map((objectPath) => deleteKycFile(objectPath)),
        );
      }

      throw error;
    }
  }
}

export const usersService = new UsersService();
