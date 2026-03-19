/**
 * Trip Request Types
 */

export interface CreateTripRequestInput {
  destination: string;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  budget?: number;
  travelers?: number;
  description?: string;
}

export interface UpdateTripRequestInput {
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  travelers?: number;
  description?: string;
}

export interface TripRequestResponse {
  id: string;
  userId: string;
  userName?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number | null;
  travelers: number;
  description: string | null;
  status: string;
  bidsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
