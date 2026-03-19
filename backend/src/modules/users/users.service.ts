import { prisma } from '../../config/database';
import { UserProfileResponse, UpdateProfileInput } from './users.types';

/**
 * Users Service
 * Handles user profile business logic
 */
export class UsersService {
  /**
   * Get user profile by auth UID
   */
  async getProfile(authUid: string): Promise<UserProfileResponse> {
    const user = await prisma.user.findUnique({
      where: { authUid },
    });

    if (!user) throw new Error('User profile not found');

    return {
      id: user.id,
      authUid: user.authUid,
      email: user.email,
      name: user.name,
      phone: user.phone,
      cnic: user.cnic,
      cnicVerified: user.cnicVerified,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(authUid: string, input: UpdateProfileInput): Promise<UserProfileResponse> {
    const existing = await prisma.user.findUnique({ where: { authUid } });
    if (!existing) throw new Error('User profile not found');

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.avatar !== undefined) updateData.avatar = input.avatar;

    const user = await prisma.user.update({
      where: { authUid },
      data: updateData,
    });

    return {
      id: user.id,
      authUid: user.authUid,
      email: user.email,
      name: user.name,
      phone: user.phone,
      cnic: user.cnic,
      cnicVerified: user.cnicVerified,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const usersService = new UsersService();
