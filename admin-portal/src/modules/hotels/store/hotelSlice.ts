import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Hotel, PaginatedResponse } from '../../../shared/types';
import { hotelService } from '../services/hotelService';

interface HotelState {
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: HotelState = {
  hotels: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    return await hotelService.getHotels(params);
  }
);

export const approveHotel = createAsyncThunk(
  'hotels/approveHotel',
  async ({ id, reason }: { id: string; reason?: string }) => {
    return await hotelService.approveHotel(id, reason);
  }
);

export const rejectHotel = createAsyncThunk(
  'hotels/rejectHotel',
  async ({ id, reason }: { id: string; reason?: string }) => {
    return await hotelService.rejectHotel(id, reason);
  }
);

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch hotels';
      })
      .addCase(approveHotel.fulfilled, (state, action) => {
        const index = state.hotels.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
      })
      .addCase(rejectHotel.fulfilled, (state, action) => {
        const index = state.hotels.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
      });
  },
});

export default hotelSlice.reducer;

