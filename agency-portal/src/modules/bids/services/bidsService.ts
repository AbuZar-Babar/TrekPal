import apiClient from '../../../shared/services/apiClient';
import { Bid, OfferDetails, PaginatedResponse } from '../../../shared/types';

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

  async getBidById(bidId: string): Promise<Bid> {
    const response = await apiClient.get(`/bids/${bidId}`);
    return response.data.data;
  },

  async createBid(data: {
    tripRequestId: string;
    price: number;
    description?: string;
    offerDetails: OfferDetails;
  }): Promise<Bid> {
    const response = await apiClient.post('/bids', data);
    return response.data.data;
  },

  async createCounterOffer(data: {
    bidId: string;
    price: number;
    description?: string;
    offerDetails: OfferDetails;
  }): Promise<Bid> {
    const response = await apiClient.post(`/bids/${data.bidId}/counteroffer`, {
      price: data.price,
      description: data.description,
      offerDetails: data.offerDetails,
    });
    return response.data.data;
  },
};
