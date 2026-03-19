import apiClient from '../../../shared/services/apiClient';
import { Bid, PaginatedResponse } from '../../../shared/types';

export const bidsService = {
  async getBids(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Bid>> {
    const response = await apiClient.get('/bids', { params });
    const result = response.data.data;

    return {
      data: result.bids,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  },

  async createBid(data: {
    tripRequestId: string;
    price: number;
    description?: string;
  }): Promise<Bid> {
    const response = await apiClient.post('/bids', data);
    return response.data.data;
  },
};
