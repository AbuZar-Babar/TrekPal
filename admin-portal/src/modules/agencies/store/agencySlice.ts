import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Agency, PaginatedResponse } from '../../../shared/types';
import { agencyService } from '../services/agencyService';

interface AgencyState {
  agencies: Agency[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: AgencyState = {
  agencies: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

export const fetchAgencies = createAsyncThunk(
  'agencies/fetchAgencies',
  async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    return await agencyService.getAgencies(params);
  }
);

export const approveAgency = createAsyncThunk(
  'agencies/approveAgency',
  async ({ id, reason }: { id: string; reason?: string }) => {
    return await agencyService.approveAgency(id, reason);
  }
);

export const rejectAgency = createAsyncThunk(
  'agencies/rejectAgency',
  async ({ id, reason }: { id: string; reason?: string }) => {
    return await agencyService.rejectAgency(id, reason);
  }
);

const agencySlice = createSlice({
  name: 'agencies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgencies.fulfilled, (state, action) => {
        state.loading = false;
        state.agencies = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchAgencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch agencies';
      })
      .addCase(approveAgency.fulfilled, (state, action) => {
        const index = state.agencies.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.agencies[index] = action.payload;
        }
      })
      .addCase(rejectAgency.fulfilled, (state, action) => {
        const index = state.agencies.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.agencies[index] = action.payload;
        }
      });
  },
});

export default agencySlice.reducer;

