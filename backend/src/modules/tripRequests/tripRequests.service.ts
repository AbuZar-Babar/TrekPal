import type { Prisma } from '@prisma/client';

import { prisma } from '../../config/database';
import {
  CreateTripRequestInput,
  TripRequestFiltersInput,
  TripRequestResponse,
  UpdateTripRequestInput,
  normalizeTripSpecs,
  tripSpecsToJson,
} from './tripRequests.types';

const tripRequestInclude = {
  user: { select: { name: true } },
  _count: { select: { bids: true } },
};

function mapTripRequest(tripRequest: any): TripRequestResponse {
  return {
    id: tripRequest.id,
    userId: tripRequest.userId,
    userName: tripRequest.user.name ?? undefined,
    destination: tripRequest.destination,
    startDate: tripRequest.startDate,
    endDate: tripRequest.endDate,
    budget: tripRequest.budget,
    travelers: tripRequest.travelers,
    description: tripRequest.description,
    tripSpecs: normalizeTripSpecs(tripRequest.tripSpecs),
    status: tripRequest.status,
    bidsCount: tripRequest._count.bids,
    createdAt: tripRequest.createdAt,
    updatedAt: tripRequest.updatedAt,
  };
}

/**
 * Trip Requests Service
 * Handles trip request business logic
 */
export class TripRequestsService {
  /**
   * Create a new trip request (traveler only)
   */
  async createTripRequest(
    userId: string,
    input: CreateTripRequestInput,
  ): Promise<TripRequestResponse> {
    if (new Date(input.endDate) < new Date(input.startDate)) {
      throw new Error('End date must be on or after start date');
    }

    const tripRequest = await prisma.tripRequest.create({
      data: {
        userId,
        destination: input.destination,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        budget: input.budget ?? null,
        travelers: input.travelers ?? 1,
        description: input.description ?? null,
        tripSpecs: tripSpecsToJson(input.tripSpecs),
        status: 'PENDING',
      },
      include: tripRequestInclude,
    });

    return mapTripRequest(tripRequest);
  }

  /**
   * Get trip requests with filtering and pagination
   * - Travelers see their own requests
   * - Agencies see all PENDING requests (to bid on)
   * - Admins see all requests
   */
  async getTripRequests(
    filters: TripRequestFiltersInput & {
      userId?: string;
    },
  ): Promise<{
    tripRequests: TripRequestResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { userId, status, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: {
      userId?: string;
      status?: string;
      OR?: Array<Record<string, unknown>>;
    } = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { destination: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tripRequests, total] = await Promise.all([
      prisma.tripRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: tripRequestInclude,
      }),
      prisma.tripRequest.count({ where }),
    ]);

    return {
      tripRequests: tripRequests.map(mapTripRequest),
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single trip request by ID
   */
  async getTripRequestById(id: string): Promise<TripRequestResponse> {
    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id },
      include: tripRequestInclude,
    });

    if (!tripRequest) {
      throw new Error('Trip request not found');
    }

    return mapTripRequest(tripRequest);
  }

  /**
   * Update own trip request (traveler only, only if no bids exist)
   */
  async updateTripRequest(
    id: string,
    userId: string,
    input: UpdateTripRequestInput,
  ): Promise<TripRequestResponse> {
    const existing = await prisma.tripRequest.findUnique({
      where: { id },
      include: {
        _count: { select: { bids: true } },
      },
    });

    if (!existing) {
      throw new Error('Trip request not found');
    }

    if (existing.userId !== userId) {
      throw new Error('Unauthorized: not your trip request');
    }

    if (existing.status !== 'PENDING') {
      throw new Error('Cannot update a non-pending trip request');
    }

    if (existing._count.bids > 0) {
      throw new Error('Cannot update a trip request after agencies have started bidding');
    }

    const nextStartDate = input.startDate
      ? new Date(input.startDate)
      : existing.startDate;
    const nextEndDate = input.endDate
      ? new Date(input.endDate)
      : existing.endDate;

    if (nextEndDate < nextStartDate) {
      throw new Error('End date must be on or after start date');
    }

    const updateData: Prisma.TripRequestUpdateInput = {};

    if (input.destination !== undefined) {
      updateData.destination = input.destination;
    }

    if (input.startDate !== undefined) {
      updateData.startDate = new Date(input.startDate);
    }

    if (input.endDate !== undefined) {
      updateData.endDate = new Date(input.endDate);
    }

    if (input.budget !== undefined) {
      updateData.budget = input.budget;
    }

    if (input.travelers !== undefined) {
      updateData.travelers = input.travelers;
    }

    if (input.description !== undefined) {
      updateData.description = input.description ?? null;
    }

    if (input.tripSpecs !== undefined) {
      updateData.tripSpecs = tripSpecsToJson(input.tripSpecs);
    }

    const tripRequest = await prisma.tripRequest.update({
      where: { id },
      data: updateData,
      include: tripRequestInclude,
    });

    return mapTripRequest(tripRequest);
  }

  /**
   * Cancel a trip request (traveler only)
   */
  async cancelTripRequest(id: string, userId: string): Promise<void> {
    const existing = await prisma.tripRequest.findUnique({ where: { id } });

    if (!existing) {
      throw new Error('Trip request not found');
    }

    if (existing.userId !== userId) {
      throw new Error('Unauthorized: not your trip request');
    }

    if (existing.status === 'CANCELLED') {
      throw new Error('Trip request is already cancelled');
    }

    await prisma.tripRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}

export const tripRequestsService = new TripRequestsService();
