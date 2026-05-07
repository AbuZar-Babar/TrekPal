import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { VehicleProvider } from '../../../shared/types';
import { vehicleProvidersService } from '../services/vehicleProvidersService';

interface VehicleProvidersState {
  providers: VehicleProvider[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: VehicleProvidersState = {
  providers: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

export const fetchVehicleProviders = createAsyncThunk(
  'vehicleProviders/fetchVehicleProviders',
  async (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    vehicleProvidersService.getVehicleProviders(params),
);

export const approveVehicleProvider = createAsyncThunk(
  'vehicleProviders/approveVehicleProvider',
  async ({ id, reason }: { id: string; reason?: string }) =>
    vehicleProvidersService.approveVehicleProvider(id, reason),
);

export const rejectVehicleProvider = createAsyncThunk(
  'vehicleProviders/rejectVehicleProvider',
  async ({ id, reason }: { id: string; reason?: string }) =>
    vehicleProvidersService.rejectVehicleProvider(id, reason),
);

const vehicleProvidersSlice = createSlice({
  name: 'vehicleProviders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicleProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.providers = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchVehicleProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch vehicle providers';
      })
      .addCase(approveVehicleProvider.fulfilled, (state, action) => {
        const idx = state.providers.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) state.providers[idx] = action.payload;
      })
      .addCase(rejectVehicleProvider.fulfilled, (state, action) => {
        const idx = state.providers.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) state.providers[idx] = action.payload;
      });
  },
});

export default vehicleProvidersSlice.reducer;
