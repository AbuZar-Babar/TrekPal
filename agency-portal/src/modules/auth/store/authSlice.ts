import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../../shared/types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  authChecked: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
  authChecked: false,
};

/**
 * Login thunk
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await authService.login(email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response.user;
  }
);

/**
 * Signup thunk - sends KYC documents with FormData
 */
export const signup = createAsyncThunk(
  'auth/signup',
  async (data: {
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
    ownerPhoto: File;
    licenseCertificate: File;
    ntnCertificate: File;
    officeProof: File;
    bankCertificate: File;
    businessRegistrationProof?: File;
    additionalSupportingDocument?: File;
    secpRegistrationNumber?: string;
    partnershipRegistrationNumber?: string;
  }) => {
    const response = await authService.signup(data);
    // Don't store token/user if status is PENDING - they need approval first
    if (response.status === 'PENDING') {
      return { user: response.user, status: 'PENDING' };
    }
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response.user;
  }
);

/**
 * Get profile thunk
 */
export const getProfile = createAsyncThunk('auth/getProfile', async () => {
  return await authService.getProfile();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authChecked = true;
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // If status is PENDING, don't authenticate
        if (payload?.status === 'PENDING') {
          state.user = payload.user;
          state.isAuthenticated = false;
        } else {
          state.user = payload as User;
          state.isAuthenticated = true;
        }
        state.authChecked = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Signup failed';
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.error.message || 'Authentication failed';
        state.isAuthenticated = false;
        state.authChecked = true;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
