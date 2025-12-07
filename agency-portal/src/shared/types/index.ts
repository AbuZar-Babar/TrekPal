/**
 * Shared TypeScript types
 */

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: 'TRAVELER' | 'AGENCY' | 'ADMIN';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'; // For agencies
}

export interface Agency {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  license: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}
