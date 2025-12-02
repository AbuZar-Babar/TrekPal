import { prisma } from '../../config/database';
import { APPROVAL_STATUS } from '../../config/constants';
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleResponse,
} from './transport.types';

/**
 * Transport Service
 * Handles vehicle/transport business logic
 */
export class TransportService {
  /**
   * Create a new vehicle (for agency)
   */
  async createVehicle(agencyId: string, input: CreateVehicleInput): Promise<VehicleResponse> {
    const vehicle = await prisma.vehicle.create({
      data: {
        agencyId,
        type: input.type,
        make: input.make,
        model: input.model,
        year: input.year,
        capacity: input.capacity,
        pricePerDay: input.pricePerDay,
        images: input.images || [],
        status: APPROVAL_STATUS.PENDING,
        isAvailable: input.isAvailable ?? true,
      },
      include: {
        agency: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: vehicle.id,
      agencyId: vehicle.agencyId,
      agencyName: vehicle.agency.name,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      capacity: vehicle.capacity,
      pricePerDay: vehicle.pricePerDay,
      status: vehicle.status,
      isAvailable: vehicle.isAvailable,
      images: vehicle.images,
      createdAt: vehicle.createdAt,
    };
  }

  /**
   * Get all vehicles for an agency
   */
  async getAgencyVehicles(
    agencyId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
  ): Promise<{ vehicles: VehicleResponse[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where: any = {
      agencyId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agency: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    const vehiclesResponse: VehicleResponse[] = vehicles.map((vehicle) => ({
      id: vehicle.id,
      agencyId: vehicle.agencyId,
      agencyName: vehicle.agency.name,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      capacity: vehicle.capacity,
      pricePerDay: vehicle.pricePerDay,
      status: vehicle.status,
      isAvailable: vehicle.isAvailable,
      images: vehicle.images,
      createdAt: vehicle.createdAt,
    }));

    return {
      vehicles: vehiclesResponse,
      total,
      page,
      limit,
    };
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(vehicleId: string, agencyId?: string): Promise<VehicleResponse> {
    const where: any = { id: vehicleId };
    if (agencyId) {
      where.agencyId = agencyId;
    }

    const vehicle = await prisma.vehicle.findUnique({
      where,
      include: {
        agency: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    return {
      id: vehicle.id,
      agencyId: vehicle.agencyId,
      agencyName: vehicle.agency.name,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      capacity: vehicle.capacity,
      pricePerDay: vehicle.pricePerDay,
      status: vehicle.status,
      isAvailable: vehicle.isAvailable,
      images: vehicle.images,
      createdAt: vehicle.createdAt,
    };
  }

  /**
   * Update vehicle (for agency)
   */
  async updateVehicle(
    vehicleId: string,
    agencyId: string,
    input: UpdateVehicleInput
  ): Promise<VehicleResponse> {
    // Verify vehicle belongs to agency
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existingVehicle) {
      throw new Error('Vehicle not found');
    }

    if (existingVehicle.agencyId !== agencyId) {
      throw new Error('Unauthorized: Vehicle does not belong to your agency');
    }

    // If status is APPROVED, don't allow updates that would change status back to PENDING
    const updateData: any = {};
    if (input.type !== undefined) updateData.type = input.type;
    if (input.make !== undefined) updateData.make = input.make;
    if (input.model !== undefined) updateData.model = input.model;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.pricePerDay !== undefined) updateData.pricePerDay = input.pricePerDay;
    if (input.images !== undefined) updateData.images = input.images;
    if (input.isAvailable !== undefined) updateData.isAvailable = input.isAvailable;

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
      include: {
        agency: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: vehicle.id,
      agencyId: vehicle.agencyId,
      agencyName: vehicle.agency.name,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      capacity: vehicle.capacity,
      pricePerDay: vehicle.pricePerDay,
      status: vehicle.status,
      isAvailable: vehicle.isAvailable,
      images: vehicle.images,
      createdAt: vehicle.createdAt,
    };
  }

  /**
   * Delete vehicle (for agency)
   */
  async deleteVehicle(vehicleId: string, agencyId: string): Promise<void> {
    // Verify vehicle belongs to agency
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    if (vehicle.agencyId !== agencyId) {
      throw new Error('Unauthorized: Vehicle does not belong to your agency');
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });
  }
}

export const transportService = new TransportService();
