import { prisma } from '../../config/database';
import { APPROVAL_STATUS } from '../../config/constants';
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleResponse,
} from './transport.types';
import { normalizeMediaStoragePaths, resolveMediaUrls } from '../../services/media-storage.service';

/**
 * Transport Service
 * Handles vehicle/transport business logic
 */
export class TransportService {
  private async mapVehicleResponse(vehicle: {
    id: string;
    agencyId: string;
    agency: { name: string };
    type: string;
    make: string;
    model: string;
    year: number;
    capacity: number;
    pricePerDay: number;
    status: string;
    isAvailable: boolean;
    images: string[];
    vehicleNumber: string | null;
    driverName: string | null;
    driverPhone: string | null;
    driverLicense: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<VehicleResponse> {
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
      images: await resolveMediaUrls(vehicle.images),
      vehicleNumber: vehicle.vehicleNumber,
      driverName: vehicle.driverName,
      driverPhone: vehicle.driverPhone,
      driverLicense: vehicle.driverLicense,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

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
        images: normalizeMediaStoragePaths(input.images || []),
        status: APPROVAL_STATUS.APPROVED,
        isAvailable: input.isAvailable ?? true,
        vehicleNumber: input.vehicleNumber ?? null,
        driverName: input.driverName ?? null,
        driverPhone: input.driverPhone ?? null,
        driverLicense: input.driverLicense ?? null,
      },
      include: {
        agency: {
          select: {
            name: true,
          },
        },
      },
    });

    return await this.mapVehicleResponse(vehicle);
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
    return this.getVehicles(page, limit, status, search, agencyId);
  }

  /**
   * Get all vehicles (discovery)
   */
  async getVehicles(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
    agencyId?: string
  ): Promise<{ vehicles: VehicleResponse[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (agencyId) {
      where.agencyId = agencyId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        { vehicleNumber: { contains: search, mode: 'insensitive' } },
        { driverName: { contains: search, mode: 'insensitive' } },
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

    const vehiclesResponse = await Promise.all(
      vehicles.map((vehicle) => this.mapVehicleResponse(vehicle)),
    );

    return {
      vehicles: vehiclesResponse,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single vehicle by ID
   */
  async getVehicleById(vehicleId: string, agencyId?: string): Promise<VehicleResponse> {
    const where: any = { id: vehicleId };
    if (agencyId) where.agencyId = agencyId;

    const vehicle = await prisma.vehicle.findFirst({
      where,
      include: {
        agency: {
          select: { name: true },
        },
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    return await this.mapVehicleResponse(vehicle);
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

    const updateData: any = {};
    if (input.type !== undefined) updateData.type = input.type;
    if (input.make !== undefined) updateData.make = input.make;
    if (input.model !== undefined) updateData.model = input.model;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.pricePerDay !== undefined) updateData.pricePerDay = input.pricePerDay;
    if (input.images !== undefined) updateData.images = normalizeMediaStoragePaths(input.images);
    if (input.isAvailable !== undefined) updateData.isAvailable = input.isAvailable;
    if (input.vehicleNumber !== undefined) updateData.vehicleNumber = input.vehicleNumber;
    if (input.driverName !== undefined) updateData.driverName = input.driverName;
    if (input.driverPhone !== undefined) updateData.driverPhone = input.driverPhone;
    if (input.driverLicense !== undefined) updateData.driverLicense = input.driverLicense;
    updateData.status = APPROVAL_STATUS.APPROVED;

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

    return await this.mapVehicleResponse(vehicle);
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
