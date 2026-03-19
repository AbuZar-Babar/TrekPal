/**
 * Bid Types
 */

export interface CreateBidInput {
  tripRequestId: string;
  price: number;
  description?: string;
}

export interface BidResponse {
  id: string;
  tripRequestId: string;
  agencyId: string;
  agencyName: string;
  price: number;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  // Trip request summary (included when listing bids)
  tripDestination?: string;
  tripStartDate?: Date;
  tripEndDate?: Date;
}
