import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Driver } from '../../../shared/types';
import { transportService } from '../../transport/services/transportService';

interface DriversState {
  drivers: Driver[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: DriversState = {
  drivers: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchDrivers = createAsyncThunk('drivers/fetchDrivers', async () => {
  return transportService.getDrivers();
});

export const createDriver = createAsyncThunk(
  'drivers/createDriver',
  async (data: {
    name: string;
    phone: string;
    licenseNumber: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }) => transportService.createDriver(data),
);

export const updateDriver = createAsyncThunk(
  'drivers/updateDriver',
  async ({
    id,
    data,
  }: {
    id: string;
    data: {
      name?: string;
      phone?: string;
      licenseNumber?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    };
  }) => transportService.updateDriver(id, data),
);

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load drivers';
      })
      .addCase(createDriver.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createDriver.fulfilled, (state, action) => {
        state.saving = false;
        state.drivers.unshift(action.payload);
      })
      .addCase(createDriver.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to create driver';
      })
      .addCase(updateDriver.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.drivers.findIndex((driver) => driver.id === action.payload.id);
        if (index !== -1) {
          state.drivers[index] = action.payload;
        }
      })
      .addCase(updateDriver.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to update driver';
      });
  },
});

export default driversSlice.reducer;
