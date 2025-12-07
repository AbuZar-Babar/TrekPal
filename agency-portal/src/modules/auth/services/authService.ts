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
      // In development mode, use dummy authentication that checks backend
      // For now, we'll use a simple email/password check with backend
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data.data || response.data;

      // Store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, token };
    } catch (error: any) {
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed';
      
      // Check if it's a pending approval error
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
   * Register new agency - creates with PENDING status
   */
  async signup(email: string, password: string, name: string, phone?: string, address?: string, license?: string): Promise<{ user: User; token: string; status: string }> {
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    try {
      const response = await apiClient.post('/auth/register/agency', {
        email,
        password,
        name,
        phone,
        address,
        license,
      });

      const { user, token } = response.data.data || response.data;

      // Don't store token/user yet - they need approval first
      // Return status so UI can show pending message
      return { 
        user: { ...user, status: 'PENDING' }, 
        token: token || '', 
        status: 'PENDING' 
      };
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
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
