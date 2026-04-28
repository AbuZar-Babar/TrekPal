import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'HOTEL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('hotel_user') || 'null'),
  token: localStorage.getItem('hotel_token'),
  isAuthenticated: !!localStorage.getItem('hotel_token'),
  setAuth: (user, token) => {
    localStorage.setItem('hotel_user', JSON.stringify(user));
    localStorage.setItem('hotel_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('hotel_user');
    localStorage.removeItem('hotel_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
