import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Vehicle } from '../../../shared/types';
import { vehiclesService } from '../services/vehiclesService';

interface VehiclesState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: VehiclesState = {
  vehicles: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    return await vehiclesService.getVehicles(params);
  }
);

export const approveVehicle = createAsyncThunk(
  'vehicles/approveVehicle',
  async ({ id, reason }: { id: string; reason?: string }) => {
    return await vehiclesService.approveVehicle(id, reason);
  }
);

export const rejectVehicle = createAsyncThunk(
  'vehicles/rejectVehicle',
  async ({ id, reason }: { id: string; reason?: string }) => {
    return await vehiclesService.rejectVehicle(id, reason);
  }
);

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(approveVehicle.fulfilled, (state, action) => {
        const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
      })
      .addCase(rejectVehicle.fulfilled, (state, action) => {
        const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
      });
  },
});

export default vehiclesSlice.reducer;
