import { prisma } from '../../config/database';
import { APPROVAL_STATUS, BOOKING_STATUS } from '../../config/constants';
import {
  CreateDriverInput,
  CreateVehicleInput,
  DriverResponse,
  UpdateDriverInput,
  UpdateVehicleInput,
  VehicleResponse,
} from './transport.types';
import { normalizeMediaStoragePaths, resolveMediaUrls } from '../../services/media-storage.service';

type VehicleWithRelations = {
  id: string;
  vehicleProviderId: string | null;
  vehicleProvider: { name: string } | null;
  driverId: string;
  driver: {
    id: string;
    name: string;
    phone: string | null;
    licenseNumber: string | null;
    status: string;
  };
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
  createdAt: Date;
  updatedAt: Date;
};

type DriverWithRelations = {
  id: string;
  vehicleProviderId: string;
  name: string;
  phone: string | null;
  licenseNumber: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  vehicle: {
    id: string;
    make: string;
    model: string;
    vehicleNumber: string | null;
  } | null;
};

export class TransportService {
  private async mapVehicleResponse(vehicle: VehicleWithRelations): Promise<VehicleResponse> {
    if (!vehicle.vehicleProviderId || !vehicle.vehicleProvider) {
      throw new Error('Vehicle ownership is invalid. Missing vehicle provider link.');
    }

    return {
      id: vehicle.id,
      vehicleProviderId: vehicle.vehicleProviderId,
      vehicleProviderName: vehicle.vehicleProvider.name,
      driverId: vehicle.driverId,
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
      driver: {
        id: vehicle.driver.id,
        name: vehicle.driver.name,
        phone: vehicle.driver.phone,
        licenseNumber: vehicle.driver.licenseNumber,
        status: vehicle.driver.status,
      },
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

  private mapDriverResponse(driver: DriverWithRelations): DriverResponse {
    return {
      id: driver.id,
      vehicleProviderId: driver.vehicleProviderId,
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      status: driver.status,
      vehicleId: driver.vehicle?.id ?? null,
      vehicleLabel: driver.vehicle
        ? `${driver.vehicle.make} ${driver.vehicle.model}${driver.vehicle.vehicleNumber ? ` (${driver.vehicle.vehicleNumber})` : ''}`
        : null,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
    };
  }

  private async ensureDriverAssignable(
    vehicleProviderId: string,
    driverId: string,
    currentVehicleId?: string,
  ): Promise<void> {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        vehicle: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!driver || driver.vehicleProviderId !== vehicleProviderId) {
      throw new Error('Selected driver was not found for this vehicle provider');
    }

    if (driver.status !== 'ACTIVE') {
      throw new Error('Selected driver is inactive');
    }

    if (driver.vehicle && driver.vehicle.id !== currentVehicleId) {
      throw new Error('Selected driver is already assigned to another vehicle');
    }
  }

  async createDriver(vehicleProviderId: string, input: CreateDriverInput): Promise<DriverResponse> {
    const driver = await prisma.driver.create({
      data: {
        vehicleProviderId,
        name: input.name,
        phone: input.phone ?? null,
        licenseNumber: input.licenseNumber ?? null,
        status: input.status ?? 'ACTIVE',
      },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            vehicleNumber: true,
          },
        },
      },
    });

    return this.mapDriverResponse(driver);
  }

  async getOwnerDrivers(vehicleProviderId: string): Promise<DriverResponse[]> {
    const drivers = await prisma.driver.findMany({
      where: { vehicleProviderId },
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            vehicleNumber: true,
          },
        },
      },
    });

    return drivers.map((driver) => this.mapDriverResponse(driver));
  }

  async updateDriver(
    driverId: string,
    vehicleProviderId: string,
    input: UpdateDriverInput,
  ): Promise<DriverResponse> {
    const existing = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        vehicle: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existing || existing.vehicleProviderId !== vehicleProviderId) {
      throw new Error('Driver not found');
    }

    if (
      input.status === 'INACTIVE' &&
      existing.vehicle?.id
    ) {
      const activeBookings = await prisma.booking.count({
        where: {
          driverId,
          status: {
            in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
          },
        },
      });

      if (activeBookings > 0) {
        throw new Error('Drivers with active bookings cannot be marked inactive');
      }
    }

    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.licenseNumber !== undefined ? { licenseNumber: input.licenseNumber } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            vehicleNumber: true,
          },
        },
      },
    });

    return this.mapDriverResponse(driver);
  }

  async createVehicle(vehicleProviderId: string, input: CreateVehicleInput): Promise<VehicleResponse> {
    await this.ensureDriverAssignable(vehicleProviderId, input.driverId);

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleProviderId,
        driverId: input.driverId,
        type: input.type,
        make: input.make,
        model: input.model,
        year: input.year,
        capacity: input.capacity,
        pricePerDay: input.pricePerDay,
        images: normalizeMediaStoragePaths(input.images || []),
        status: APPROVAL_STATUS.PENDING,
        isAvailable: input.isAvailable ?? true,
        vehicleNumber: input.vehicleNumber ?? null,
      },
      include: {
        vehicleProvider: {
          select: {
            name: true,
          },
        },
        driver: true,
      },
    });

    return this.mapVehicleResponse(vehicle);
  }

  async getOwnerVehicles(
    vehicleProviderId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
  ): Promise<{ vehicles: VehicleResponse[]; total: number; page: number; limit: number }> {
    return this.getVehicles(page, limit, status, search, vehicleProviderId);
  }

  async getVehicles(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
    vehicleProviderId?: string,
  ): Promise<{ vehicles: VehicleResponse[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (vehicleProviderId) {
      where.vehicleProviderId = vehicleProviderId;
    } else {
      where.status = APPROVAL_STATUS.APPROVED;
    }

    if (status && vehicleProviderId) {
      where.status = status;
    }

    if (search) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { type: { contains: search, mode: 'insensitive' } },
          { vehicleNumber: { contains: search, mode: 'insensitive' } },
          { driver: { name: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicleProvider: {
            select: {
              name: true,
            },
          },
          driver: true,
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      vehicles: await Promise.all(vehicles.map((vehicle) => this.mapVehicleResponse(vehicle as VehicleWithRelations))),
      total,
      page,
      limit,
    };
  }

  async getVehicleById(vehicleId: string, vehicleProviderId?: string): Promise<VehicleResponse> {
    const where: any = { id: vehicleId };
    if (vehicleProviderId) {
      where.vehicleProviderId = vehicleProviderId;
    } else {
      where.status = APPROVAL_STATUS.APPROVED;
    }

    const vehicle = await prisma.vehicle.findFirst({
      where,
      include: {
        vehicleProvider: {
          select: { name: true },
        },
        driver: true,
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    return this.mapVehicleResponse(vehicle as VehicleWithRelations);
  }

  async updateVehicle(
    vehicleId: string,
    vehicleProviderId: string,
    input: UpdateVehicleInput,
  ): Promise<VehicleResponse> {
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existingVehicle) {
      throw new Error('Vehicle not found');
    }

    if (existingVehicle.vehicleProviderId !== vehicleProviderId) {
      throw new Error('Unauthorized: Vehicle does not belong to your account');
    }

    if (input.driverId) {
      await this.ensureDriverAssignable(vehicleProviderId, input.driverId, vehicleId);
    }

    const updateData: any = {};
    if (input.driverId !== undefined) updateData.driverId = input.driverId;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.make !== undefined) updateData.make = input.make;
    if (input.model !== undefined) updateData.model = input.model;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.pricePerDay !== undefined) updateData.pricePerDay = input.pricePerDay;
    if (input.images !== undefined) updateData.images = normalizeMediaStoragePaths(input.images);
    if (input.isAvailable !== undefined) updateData.isAvailable = input.isAvailable;
    if (input.vehicleNumber !== undefined) updateData.vehicleNumber = input.vehicleNumber;
    updateData.status = APPROVAL_STATUS.PENDING;

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
      include: {
        vehicleProvider: {
          select: {
            name: true,
          },
        },
        driver: true,
      },
    });

    await prisma.booking.updateMany({
      where: {
        vehicleId,
        status: {
          in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
        },
      },
      data: {
        driverId: vehicle.driverId,
        driverNameSnapshot: vehicle.driver.name,
        driverPhoneSnapshot: vehicle.driver.phone,
        vehicleNumberSnapshot: vehicle.vehicleNumber,
      },
    });

    return this.mapVehicleResponse(vehicle as VehicleWithRelations);
  }

  async deleteVehicle(vehicleId: string, vehicleProviderId: string): Promise<void> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    if (vehicle.vehicleProviderId !== vehicleProviderId) {
      throw new Error('Unauthorized: Vehicle does not belong to your account');
    }

    const activeBookings = await prisma.booking.count({
      where: {
        vehicleId,
        status: {
          in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
        },
      },
    });

    if (activeBookings > 0) {
      throw new Error('Vehicles with active bookings cannot be deleted');
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });
  }
}

export const transportService = new TransportService();
