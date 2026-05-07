import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TripRequest } from '../../../shared/types';
import { tripRequestsService } from '../services/tripRequestsService';

interface TripRequestsState {
  tripRequests: TripRequest[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: TripRequestsState = {
  tripRequests: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

export const fetchTripRequests = createAsyncThunk(
  'tripRequests/fetchTripRequests',
  async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    return await tripRequestsService.getTripRequests(params);
  }
);

const tripRequestsSlice = createSlice({
  name: 'tripRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTripRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTripRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.tripRequests = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchTripRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch trip requests';
      });
  },
});

export default tripRequestsSlice.reducer;
