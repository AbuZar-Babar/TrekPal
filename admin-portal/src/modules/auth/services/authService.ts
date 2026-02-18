import { User } from '../../../shared/types';
import apiClient from '../../../shared/services/apiClient';

/**
 * Auth Service - Connects to backend API for authentication
 * Uses PostgreSQL database for admin credentials
 */
export const authService = {
  /**
   * Login via backend API - validates against database
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      // Call backend API for authentication
      const response = await apiClient.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password: password,
      });

      const { user, token } = response.data.data || response.data;

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('[Auth Service] Login successful for:', user.email);

      return { user, token };
    } catch (error: any) {
      console.error('[Auth Service] Login failed:', error);

      // Extract error message from response
      const message = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || 'Login failed. Please check your credentials.';

      throw new Error(message);
    }
  },

  /**
   * Get current user profile from localStorage
   */
  async getProfile(): Promise<User> {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('Not authenticated');
    }
    return JSON.parse(userStr);
  },

  /**
   * Logout - clears session and redirects to login
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};
