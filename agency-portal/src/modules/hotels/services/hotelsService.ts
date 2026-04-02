import apiClient from '../../../shared/services/apiClient';
import { Hotel, PaginatedResponse } from '../../../shared/types';

/**
 * Hotels Service - CRUD operations for hotel management
 */
export const hotelsService = {
    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await apiClient.post('/hotels/upload-image', formData);
            return response.data.data.url;
        } catch (error: any) {
            const serverError = error.response?.data?.error || error.response?.data?.message;
            throw new Error(serverError || 'Failed to upload hotel image');
        }
    },

    /**
     * Get all hotels for the agency
     */
    async getHotels(params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }): Promise<PaginatedResponse<Hotel>> {
        const response = await apiClient.get('/hotels', { params });
        const result = response.data.data;
        return {
            data: result.hotels || result.data || [],
            total: result.total || 0,
            page: result.page || 1,
            limit: result.limit || 20,
        };
    },

    /**
     * Get hotel by ID
     */
    async getHotelById(id: string): Promise<Hotel> {
        const response = await apiClient.get(`/hotels/${id}`);
        return response.data.data;
    },

    /**
     * Create a new hotel
     */
    async createHotel(data: {
        name: string;
        description?: string;
        address: string;
        city: string;
        country: string;
        latitude?: number;
        longitude?: number;
        images?: string[];
        amenities?: string[];
    }): Promise<Hotel> {
        const response = await apiClient.post('/hotels', data);
        return response.data.data;
    },

    /**
     * Update hotel
     */
    async updateHotel(
        id: string,
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
        }
    ): Promise<Hotel> {
        const response = await apiClient.put(`/hotels/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete hotel
     */
    async deleteHotel(id: string): Promise<void> {
        await apiClient.delete(`/hotels/${id}`);
    },
};
