import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { UserProfile } from '../../../shared/types';
import { usersService } from '../services/usersService';

interface UsersState {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params?: { page?: number; limit?: number; search?: string }) => {
    return usersService.getUsers(params);
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });
  },
});

export default usersSlice.reducer;
