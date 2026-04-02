import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TravelerUpdateInput, UserProfile } from '../../../shared/types';
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
  async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    return usersService.getUsers(params);
  }
);

export const approveUser = createAsyncThunk(
  'users/approveUser',
  async ({ id, reason }: { id: string; reason?: string }) => {
    return usersService.approveUser(id, reason);
  }
);

export const rejectUser = createAsyncThunk(
  'users/rejectUser',
  async ({ id, reason }: { id: string; reason?: string }) => {
    return usersService.rejectUser(id, reason);
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, payload }: { id: string; payload: TravelerUpdateInput }) => {
    return usersService.updateUser(id, payload);
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
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(rejectUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export default usersSlice.reducer;
