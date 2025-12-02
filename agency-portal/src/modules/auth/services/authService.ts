import { User } from '../../../shared/types';

/**
 * Dummy Auth Service - No backend calls
 */
export const authService = {
  /**
   * Dummy login - just validates credentials locally
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Dummy validation - accept any credentials
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Create dummy user
    const user: User = {
      id: 'agency-1',
      firebaseUid: 'dummy-uid',
      email: email,
      name: 'Agency User',
      role: 'AGENCY',
    };

    const token = 'dummy-token-' + Date.now();

    return { user, token };
  },

  /**
   * Dummy signup
   */
  async signup(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    // Create dummy user
    const user: User = {
      id: 'agency-' + Date.now(),
      firebaseUid: 'dummy-uid-' + Date.now(),
      email: email,
      name: name,
      role: 'AGENCY',
    };

    const token = 'dummy-token-' + Date.now();

    return { user, token };
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
