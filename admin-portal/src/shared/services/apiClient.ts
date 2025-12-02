import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * API Client with interceptors
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token format - must start with 'admin-dummy-token-' for admin portal
      if (!token.startsWith('admin-dummy-token-')) {
        console.warn('[API Client] Invalid token format detected. Clearing old token...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login if we're not already there
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Invalid token format. Please log in again.'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
      // Debug: Log token for troubleshooting
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Client] Token being sent:', token.substring(0, 30) + '...');
      }
    } else {
      console.warn('[API Client] No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle network errors (backend not running)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const networkError = new Error('Backend server is not running. Please start the backend server on port 3000.');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // Handle CORS errors
    if (error.code === 'ERR_CORS') {
      const corsError = new Error('CORS error: Backend server may not be configured correctly.');
      (corsError as any).isNetworkError = true;
      return Promise.reject(corsError);
    }

    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden - log details for debugging
      const token = localStorage.getItem('token');
      console.error('[API Client] 403 Forbidden error');
      console.error('[API Client] Token:', token ? token.substring(0, 40) + '...' : 'No token');
      console.error('[API Client] URL:', error.config?.url);
      console.error('[API Client] Response:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
