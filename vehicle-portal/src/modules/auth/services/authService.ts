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
   * Register new vehicle provider with basic info - creates with PENDING status
   */
  async signup(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
    ownerName: string;
    cnic: string;
    officeCity?: string;
    license?: string;
    ntn?: string;
  }): Promise<{ user: User; token: string; status: string }> {
    if (!data.email || !data.password || !data.name) {
      throw new Error('All fields are required');
    }

    try {
      const response = await apiClient.post('/auth/register/vehicle', data);

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
