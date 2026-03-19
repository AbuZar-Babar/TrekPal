/**
 * User Types
 */

export interface UserProfileResponse {
  id: string;
  authUid: string;
  email: string;
  name: string | null;
  phone: string | null;
  cnic: string | null;
  cnicVerified: boolean;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  avatar?: string;
}
