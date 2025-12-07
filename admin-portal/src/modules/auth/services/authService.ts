import { User } from '../../../shared/types';

/**
 * Dummy Auth Service - No backend calls
 */
export const authService = {
  /**
   * Dummy login - validates specific credentials only
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Check for specific credentials only
    const validEmail = 'hashim@gmail.com';
    const validPassword = '1q2w3e';

    if (email.toLowerCase().trim() !== validEmail || password !== validPassword) {
      throw new Error('Invalid email or password');
    }

    // Create dummy user
    const user: User = {
      id: 'admin-1',
      firebaseUid: 'dummy-uid',
      email: validEmail,
      name: 'Hashim Admin',
      role: 'ADMIN',
    };

    const token = 'admin-dummy-token-' + Date.now();
    
    // Store token and user in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('[Auth Service] Admin login successful, token stored:', token.substring(0, 30) + '...');

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
      id: 'admin-' + Date.now(),
      firebaseUid: 'dummy-uid-' + Date.now(),
      email: email,
      name: name,
      role: 'ADMIN',
    };

    const token = 'admin-dummy-token-' + Date.now();
    
    // Store token and user in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('[Auth Service] Admin login successful, token stored:', token.substring(0, 30) + '...');

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
