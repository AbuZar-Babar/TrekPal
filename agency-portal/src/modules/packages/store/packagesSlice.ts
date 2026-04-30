import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Package } from '../../../shared/types';
import { packagesService } from '../services/packagesService';

interface PackagesState {
  packages: Package[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: PackagesState = {
  packages: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

export const fetchPackages = createAsyncThunk(
  'packages/fetchPackages',
  async (params?: { page?: number; limit?: number; search?: string; active?: boolean }) => {
    return packagesService.getPackages(params);
  },
);

export const createPackage = createAsyncThunk(
  'packages/createPackage',
  async (data: {
    name: string;
    description?: string;
    price: number;
    duration: number;
    startDate: string;
    maxSeats?: number;
    hotelId?: string | null;
    hotelIds?: string[];
    vehicleId?: string | null;
    destinations: string[];
    images?: string[];
    isActive?: boolean;
  }) => {
    return packagesService.createPackage(data);
  },
);

export const updatePackage = createAsyncThunk(
  'packages/updatePackage',
  async ({
    id,
    data,
  }: {
    id: string;
    data: {
      name?: string;
      description?: string;
      price?: number;
      duration?: number;
      startDate?: string;
      maxSeats?: number;
      hotelId?: string | null;
      hotelIds?: string[];
      vehicleId?: string | null;
      destinations?: string[];
      images?: string[];
      isActive?: boolean;
    };
  }) => {
    return packagesService.updatePackage(id, data);
  },
);

export const deletePackage = createAsyncThunk(
  'packages/deletePackage',
  async (id: string) => {
    await packagesService.deletePackage(id);
    return id;
  },
);

const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch trip offers';
      })
      .addCase(createPackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.loading = false;
        state.packages.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create trip offer';
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        const index = state.packages.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.packages[index] = action.payload;
        }
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.packages = state.packages.filter((item) => item.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  },
});

export default packagesSlice.reducer;
