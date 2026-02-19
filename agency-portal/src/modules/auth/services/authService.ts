import { User } from '../../../shared/types';
import apiClient from '../../../shared/services/apiClient';

/**
 * Auth Service - Calls backend API
 */
export const authService = {
  /**
   * Login agency - checks if approved
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
        throw new Error('Your agency account is pending admin approval. Please wait for approval before logging in.');
      }

      if (error.message?.includes('Network Error') || error.isNetworkError) {
        throw new Error('Cannot connect to server. Please make sure the backend is running.');
      }

      throw new Error(errorMessage);
    }
  },

  /**
   * Register new agency with KYC documents - creates with PENDING status
   * Uses FormData to send files along with text fields
   */
  async signup(data: {
    email: string;
    password: string;
    name: string;
    ownerName: string;
    cnic: string;
    cnicImage: File;
    ownerPhoto: File;
    phone?: string;
    address?: string;
    license?: string;
  }): Promise<{ user: User; token: string; status: string }> {
    if (!data.email || !data.password || !data.name) {
      throw new Error('All fields are required');
    }

    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('name', data.name);
      formData.append('ownerName', data.ownerName);
      formData.append('cnic', data.cnic);
      formData.append('cnicImage', data.cnicImage);
      formData.append('ownerPhoto', data.ownerPhoto);
      if (data.phone) formData.append('phone', data.phone);
      if (data.address) formData.append('address', data.address);
      if (data.license) formData.append('license', data.license);

      const response = await apiClient.post('/auth/register/agency', formData, {
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
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('Not authenticated');
    }
    return JSON.parse(userStr);
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
