import apiClient from '../../../shared/services/apiClient';
import { Hotel, PaginatedResponse } from '../../../shared/types';

export const hotelService = {
  async getHotels(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Hotel>> {
    const response = await apiClient.get('/admin/hotels', { params });
    const result = response.data.data;
    // Backend returns { hotels, total, page, limit }, convert to { data, total, page, limit }
    return {
      data: result.hotels,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  },

  async approveHotel(id: string, reason?: string): Promise<Hotel> {
    const response = await apiClient.post(`/admin/hotels/${id}/approve`, {
      reason,
    });
    return response.data.data;
  },

  async rejectHotel(id: string, reason?: string): Promise<Hotel> {
    const response = await apiClient.post(`/admin/hotels/${id}/reject`, {
      reason,
    });
    return response.data.data;
  },
};

