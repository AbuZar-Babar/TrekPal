import apiClient from '../../../shared/services/apiClient';
import { PaginatedResponse, TripRequest } from '../../../shared/types';

export const tripRequestsService = {
  async getTripRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<TripRequest>> {
    const response = await apiClient.get('/trip-requests', { params });
    const result = response.data.data;

    return {
      data: result.tripRequests,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  },
};
