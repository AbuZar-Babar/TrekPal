import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Vehicle, PaginatedResponse } from '../../../shared/types';
import { transportService } from '../services/transportService';

interface TransportState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: TransportState = {
  vehicles: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

/**
 * Fetch vehicles thunk
 */
export const fetchVehicles = createAsyncThunk(
  'transport/fetchVehicles',
  async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    return await transportService.getVehicles(params);
  }
);

/**
 * Create vehicle thunk
 */
export const createVehicle = createAsyncThunk(
  'transport/createVehicle',
  async (data: {
    type: string;
    make: string;
    model: string;
    year: number;
    capacity: number;
    pricePerDay: number;
    images?: string[];
    isAvailable?: boolean;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    driverLicense?: string;
  }) => {
    return await transportService.createVehicle(data);
  }
);

/**
 * Update vehicle thunk
 */
export const updateVehicle = createAsyncThunk(
  'transport/updateVehicle',
  async ({
    id,
    data,
  }: {
    id: string;
    data: {
      type?: string;
      make?: string;
      model?: string;
      year?: number;
      capacity?: number;
      pricePerDay?: number;
      images?: string[];
      isAvailable?: boolean;
      vehicleNumber?: string;
      driverName?: string;
      driverPhone?: string;
      driverLicense?: string;
    };
  }) => {
    return await transportService.updateVehicle(id, data);
  }
);

/**
 * Delete vehicle thunk
 */
export const deleteVehicle = createAsyncThunk(
  'transport/deleteVehicle',
  async (id: string) => {
    await transportService.deleteVehicle(id);
    return id;
  }
);

const transportSlice = createSlice({
  name: 'transport',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch vehicles';
      })
      // Create vehicle
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create vehicle';
      })
      // Update vehicle
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
      })
      // Delete vehicle
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
        state.pagination.total -= 1;
      });
  },
});

export default transportSlice.reducer;
