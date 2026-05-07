import apiClient from '../../../shared/services/apiClient';
import { Bid, OfferDetails, PaginatedResponse } from '../../../shared/types';

const ROOM_UNAVAILABLE_ERROR_CODE = 'ROOM_UNAVAILABLE';

const readErrorMessage = (error: any, fallback: string): string => {
  const code = error?.response?.data?.errors?.[0]?.code;
  const serverMessage =
    error?.response?.data?.errors?.[0]?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error;

  if (code === ROOM_UNAVAILABLE_ERROR_CODE) {
    return (
      serverMessage ||
      'Room is no longer available for these dates. Pick another hotel/room or update dates.'
    );
  }

  return serverMessage || error?.message || fallback;
};

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
    try {
      const response = await apiClient.post('/bids', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(readErrorMessage(error, 'Failed to submit offer'));
    }
  },

  async createCounterOffer(data: {
    bidId: string;
    price: number;
    description?: string;
    offerDetails: OfferDetails;
  }): Promise<Bid> {
    try {
      const response = await apiClient.post(`/bids/${data.bidId}/counteroffer`, {
        price: data.price,
        description: data.description,
        offerDetails: data.offerDetails,
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(readErrorMessage(error, 'Failed to revise offer'));
    }
  },
};
