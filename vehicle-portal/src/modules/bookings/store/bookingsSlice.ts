import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Booking } from '../../../shared/types';
import { bookingsService } from '../services/bookingsService';

interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  updatingId: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: BookingsState = {
  bookings: [],
  loading: false,
  error: null,
  updatingId: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (params?: { page?: number; limit?: number; status?: string }) => {
    return await bookingsService.getBookings(params);
  }
);

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateBookingStatus',
  async ({
    id,
    status,
  }: {
    id: string;
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  }) => {
    return await bookingsService.updateBookingStatus(id, status);
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookings';
      })
      .addCase(updateBookingStatus.pending, (state, action) => {
        state.updatingId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.updatingId = null;
        const index = state.bookings.findIndex((booking) => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.updatingId = null;
        state.error = action.error.message || 'Failed to update booking status';
      });
  },
});

export default bookingsSlice.reducer;
