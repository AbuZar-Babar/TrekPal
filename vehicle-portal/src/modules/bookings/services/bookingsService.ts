import apiClient from '../../../shared/services/apiClient';
import { Booking, PaginatedResponse } from '../../../shared/types';

export const bookingsService = {
  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Booking>> {
    const response = await apiClient.get('/bookings', { params });
    const result = response.data.data;

    return {
      data: result.bookings,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  },

  async updateBookingStatus(id: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/status`, { status });
    return response.data.data;
  },
};
