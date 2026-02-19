import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Hotel } from '../../../shared/types';
import { hotelsService } from '../services/hotelsService';

interface HotelsState {
    hotels: Hotel[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
}

const initialState: HotelsState = {
    hotels: [],
    loading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 20,
    },
};

/**
 * Fetch hotels thunk
 */
export const fetchHotels = createAsyncThunk(
    'hotels/fetchHotels',
    async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
        return await hotelsService.getHotels(params);
    }
);

/**
 * Create hotel thunk
 */
export const createHotel = createAsyncThunk(
    'hotels/createHotel',
    async (data: {
        name: string;
        description?: string;
        address: string;
        city: string;
        country: string;
        latitude?: number;
        longitude?: number;
        images?: string[];
        amenities?: string[];
    }) => {
        return await hotelsService.createHotel(data);
    }
);

/**
 * Update hotel thunk
 */
export const updateHotel = createAsyncThunk(
    'hotels/updateHotel',
    async ({
        id,
        data,
    }: {
        id: string;
        data: {
            name?: string;
            description?: string;
            address?: string;
            city?: string;
            country?: string;
            latitude?: number;
            longitude?: number;
            images?: string[];
            amenities?: string[];
        };
    }) => {
        return await hotelsService.updateHotel(id, data);
    }
);

/**
 * Delete hotel thunk
 */
export const deleteHotel = createAsyncThunk(
    'hotels/deleteHotel',
    async (id: string) => {
        await hotelsService.deleteHotel(id);
        return id;
    }
);

const hotelsSlice = createSlice({
    name: 'hotels',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch hotels
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
            // Create hotel
            .addCase(createHotel.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createHotel.fulfilled, (state, action) => {
                state.loading = false;
                state.hotels.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createHotel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create hotel';
            })
            // Update hotel
            .addCase(updateHotel.fulfilled, (state, action) => {
                const index = state.hotels.findIndex((h) => h.id === action.payload.id);
                if (index !== -1) {
                    state.hotels[index] = action.payload;
                }
            })
            // Delete hotel
            .addCase(deleteHotel.fulfilled, (state, action) => {
                state.hotels = state.hotels.filter((h) => h.id !== action.payload);
                state.pagination.total -= 1;
            });
    },
});

export default hotelsSlice.reducer;
