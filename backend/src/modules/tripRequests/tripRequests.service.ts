import { prisma } from '../../config/database';
import {
  CreateTripRequestInput,
  UpdateTripRequestInput,
  TripRequestResponse,
} from './tripRequests.types';

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
    input: CreateTripRequestInput
  ): Promise<TripRequestResponse> {
    const tripRequest = await prisma.tripRequest.create({
      data: {
        userId,
        destination: input.destination,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        budget: input.budget ?? null,
        travelers: input.travelers ?? 1,
        description: input.description ?? null,
        status: 'PENDING',
      },
      include: {
        user: { select: { name: true } },
        _count: { select: { bids: true } },
      },
    });

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
      status: tripRequest.status,
      bidsCount: tripRequest._count.bids,
      createdAt: tripRequest.createdAt,
      updatedAt: tripRequest.updatedAt,
    };
  }

  /**
   * Get trip requests with filtering and pagination
   * - Travelers see their own requests
   * - Agencies see all PENDING requests (to bid on)
   * - Admins see all requests
   */
  async getTripRequests(
    filters: {
      userId?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ tripRequests: TripRequestResponse[]; total: number; page: number; limit: number }> {
    const { userId, status, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
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
        include: {
          user: { select: { name: true } },
          _count: { select: { bids: true } },
        },
      }),
      prisma.tripRequest.count({ where }),
    ]);

    return {
      tripRequests: tripRequests.map((tr) => ({
        id: tr.id,
        userId: tr.userId,
        userName: tr.user.name ?? undefined,
        destination: tr.destination,
        startDate: tr.startDate,
        endDate: tr.endDate,
        budget: tr.budget,
        travelers: tr.travelers,
        description: tr.description,
        status: tr.status,
        bidsCount: tr._count.bids,
        createdAt: tr.createdAt,
        updatedAt: tr.updatedAt,
      })),
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
      include: {
        user: { select: { name: true } },
        _count: { select: { bids: true } },
      },
    });

    if (!tripRequest) {
      throw new Error('Trip request not found');
    }

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
      status: tripRequest.status,
      bidsCount: tripRequest._count.bids,
      createdAt: tripRequest.createdAt,
      updatedAt: tripRequest.updatedAt,
    };
  }

  /**
   * Update own trip request (traveler only, only if PENDING)
   */
  async updateTripRequest(
    id: string,
    userId: string,
    input: UpdateTripRequestInput
  ): Promise<TripRequestResponse> {
    const existing = await prisma.tripRequest.findUnique({ where: { id } });

    if (!existing) throw new Error('Trip request not found');
    if (existing.userId !== userId) throw new Error('Unauthorized: not your trip request');
    if (existing.status !== 'PENDING') throw new Error('Cannot update a non-pending trip request');

    const updateData: any = {};
    if (input.destination !== undefined) updateData.destination = input.destination;
    if (input.startDate !== undefined) updateData.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) updateData.endDate = new Date(input.endDate);
    if (input.budget !== undefined) updateData.budget = input.budget;
    if (input.travelers !== undefined) updateData.travelers = input.travelers;
    if (input.description !== undefined) updateData.description = input.description;

    const tripRequest = await prisma.tripRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true } },
        _count: { select: { bids: true } },
      },
    });

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
      status: tripRequest.status,
      bidsCount: tripRequest._count.bids,
      createdAt: tripRequest.createdAt,
      updatedAt: tripRequest.updatedAt,
    };
  }

  /**
   * Cancel a trip request (traveler only)
   */
  async cancelTripRequest(id: string, userId: string): Promise<void> {
    const existing = await prisma.tripRequest.findUnique({ where: { id } });

    if (!existing) throw new Error('Trip request not found');
    if (existing.userId !== userId) throw new Error('Unauthorized: not your trip request');
    if (existing.status === 'CANCELLED') throw new Error('Trip request is already cancelled');

    await prisma.tripRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}

export const tripRequestsService = new TripRequestsService();
