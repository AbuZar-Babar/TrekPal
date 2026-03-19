import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Bid } from '../../../shared/types';
import { bidsService } from '../services/bidsService';

interface BidsState {
  bids: Bid[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: BidsState = {
  bids: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

export const fetchAgencyBids = createAsyncThunk(
  'bids/fetchAgencyBids',
  async (params?: { page?: number; limit?: number; status?: string }) => {
    return await bidsService.getBids(params);
  }
);

export const createBid = createAsyncThunk(
  'bids/createBid',
  async (data: { tripRequestId: string; price: number; description?: string }) => {
    return await bidsService.createBid(data);
  }
);

const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgencyBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgencyBids.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchAgencyBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bids';
      })
      .addCase(createBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.loading = false;
        state.bids.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to submit bid';
      });
  },
});

export default bidsSlice.reducer;
