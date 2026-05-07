import { User } from '../../../shared/types';
import apiClient from '../../../shared/services/apiClient';

/**
 * Auth Service - Calls backend API
 */
export const authService = {
  /**
   * Login vehicle provider - checks if approved
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data.data || response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, token };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed';

      if (errorMessage.toLowerCase().includes('pending approval') || errorMessage.toLowerCase().includes('pending admin')) {
        throw new Error('Your vehicle provider account is pending admin approval. Please wait for approval before logging in.');
      }

      if (errorMessage.toLowerCase().includes('rejected')) {
        throw new Error('Your vehicle provider application was rejected. Contact admin or register again.');
      }

      if (error.message?.includes('Network Error') || error.isNetworkError) {
        throw new Error('Cannot connect to server. Please make sure the backend is running.');
      }

      throw new Error(errorMessage);
    }
  },

  /**
   * Register new vehicle provider with KYC documents - creates with PENDING status
   * Uses FormData to send files along with text fields
   */
  async signup(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
    officeCity: string;
    jurisdiction: 'ICT' | 'Punjab' | 'Sindh' | 'KPK' | 'Balochistan' | 'AJK' | 'Gilgit-Baltistan';
    legalEntityType: 'SOLE_PROPRIETOR' | 'PARTNERSHIP' | 'COMPANY';
    license: string;
    ntn: string;
    ownerName: string;
    cnic: string;
    fieldOfOperations: string[];
    capitalAvailablePkr: number;
    cnicImage: File;
    secpRegistrationNumber?: string;
    partnershipRegistrationNumber?: string;
  }): Promise<{ user: User; token: string; status: string }> {
    if (!data.email || !data.password || !data.name) {
      throw new Error('All fields are required');
    }

    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('address', data.address);
      formData.append('officeCity', data.officeCity);
      formData.append('jurisdiction', data.jurisdiction);
      formData.append('legalEntityType', data.legalEntityType);
      formData.append('license', data.license);
      formData.append('ntn', data.ntn);
      formData.append('ownerName', data.ownerName);
      formData.append('cnic', data.cnic);
      formData.append('fieldOfOperations', JSON.stringify(data.fieldOfOperations));
      formData.append('capitalAvailablePkr', String(data.capitalAvailablePkr));
      formData.append('cnicImage', data.cnicImage);
      if (data.secpRegistrationNumber) {
        formData.append('secpRegistrationNumber', data.secpRegistrationNumber);
      }
      if (data.partnershipRegistrationNumber) {
        formData.append('partnershipRegistrationNumber', data.partnershipRegistrationNumber);
      }

      const response = await apiClient.post('/auth/register/vehicle', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { user, token } = response.data.data || response.data;

      return {
        user: { ...user, status: 'PENDING' },
        token: token || '',
        status: 'PENDING'
      };
    } catch (error: any) {
      const serverError = error.response?.data?.error
        || error.response?.data?.message
        || error.response?.data?.details?.map((d: any) => d.message).join(', ');
      if (serverError) {
        throw new Error(serverError);
      }
      if (error.message?.includes('Network Error') || error.isNetworkError) {
        throw new Error('Cannot connect to server. Please make sure the backend is running.');
      }
      throw new Error(error.message || 'Registration failed');
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await apiClient.get('/auth/profile');
      const user = response.data.data || response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to get profile';

      if (errorMessage.toLowerCase().includes('pending approval') || errorMessage.toLowerCase().includes('pending admin')) {
        throw new Error('Your vehicle provider account is pending admin approval. Please wait for approval before logging in.');
      }

      if (errorMessage.toLowerCase().includes('rejected')) {
        throw new Error('Your vehicle provider application was rejected. Contact admin or register again.');
      }

      throw new Error(errorMessage);
    }
  },

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};
