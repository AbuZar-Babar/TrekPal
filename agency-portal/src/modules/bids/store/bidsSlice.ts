import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Bid, OfferDetails } from '../../../shared/types';
import { bidsService } from '../services/bidsService';

interface BidsState {
  bids: Bid[];
  selectedBid: Bid | null;
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
  selectedBid: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

const mergeBid = (bids: Bid[], updatedBid: Bid): Bid[] => {
  const existingIndex = bids.findIndex((bid) => bid.id === updatedBid.id);
  if (existingIndex === -1) {
    return [updatedBid, ...bids];
  }

  return bids.map((bid) => (bid.id === updatedBid.id ? updatedBid : bid));
};

export const fetchAgencyBids = createAsyncThunk(
  'bids/fetchAgencyBids',
  async (params?: { page?: number; limit?: number; status?: string }) => {
    return await bidsService.getBids(params);
  },
);

export const fetchBidThread = createAsyncThunk(
  'bids/fetchBidThread',
  async (bidId: string) => {
    return await bidsService.getBidById(bidId);
  },
);

export const createBid = createAsyncThunk(
  'bids/createBid',
  async (data: {
    tripRequestId: string;
    price: number;
    description?: string;
    offerDetails: OfferDetails;
  }) => {
    return await bidsService.createBid(data);
  },
);

export const createCounterOffer = createAsyncThunk(
  'bids/createCounterOffer',
  async (data: {
    bidId: string;
    price: number;
    description?: string;
    offerDetails: OfferDetails;
  }) => {
    return await bidsService.createCounterOffer(data);
  },
);

const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    clearSelectedBid(state) {
      state.selectedBid = null;
    },
  },
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
      .addCase(fetchBidThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidThread.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBid = action.payload;
        state.bids = mergeBid(state.bids, action.payload);
      })
      .addCase(fetchBidThread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bid thread';
      })
      .addCase(createBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBid = action.payload;
        state.bids = mergeBid(state.bids, action.payload);
        state.pagination.total += 1;
      })
      .addCase(createBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to submit offer';
      })
      .addCase(createCounterOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCounterOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBid = action.payload;
        state.bids = mergeBid(state.bids, action.payload);
      })
      .addCase(createCounterOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to revise offer';
      });
  },
});

export const { clearSelectedBid } = bidsSlice.actions;

export default bidsSlice.reducer;
