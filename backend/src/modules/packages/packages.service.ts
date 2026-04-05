import { prisma } from '../../config/database';
import { BOOKING_STATUS, ROLES } from '../../config/constants';
import { createSignedKycUrl, isHttpUrl } from '../../services/kyc-storage.service';
import { resolveMediaUrls } from '../../services/media-storage.service';
import { emitOfferUpdated } from '../../ws/socket.emitter';
import {
  ApplyPackageInput,
  CreatePackageInput,
  PackageFiltersInput,
  PackageParticipantPreview,
  PackageResponse,
  UpdatePackageInput,
} from './packages.types';

const packageInclude = {
  agency: {
    select: {
      name: true,
    },
  },
  hotel: {
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
      rating: true,
      images: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      type: true,
      make: true,
      model: true,
      capacity: true,
      images: true,
    },
  },
  bookings: {
    where: {
      status: BOOKING_STATUS.CONFIRMED,
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      userId: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          dateOfBirth: true,
          gender: true,
          avatar: true,
        },
      },
    },
  },
} as const;

const buildInitials = (name?: string | null): string => {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) {
    return 'TP';
  }

  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
};

const deriveAge = (dateOfBirth?: Date | null): number | null => {
  if (!dateOfBirth) {
    return null;
  }

  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const hasBirthdayPassed =
    now.getMonth() > dateOfBirth.getMonth() ||
    (now.getMonth() === dateOfBirth.getMonth() &&
      now.getDate() >= dateOfBirth.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

const resolveAvatarUrl = async (value?: string | null): Promise<string | null> => {
  if (!value) {
    return null;
  }

  if (isHttpUrl(value)) {
    return value;
  }

  try {
    return await createSignedKycUrl(value);
  } catch {
    return null;
  }
};

const mapParticipant = async (booking: any): Promise<PackageParticipantPreview> => ({
  userId: booking.userId,
  travelerName: booking.user?.name?.trim() || 'Traveler',
  initials: buildInitials(booking.user?.name),
  age: deriveAge(booking.user?.dateOfBirth),
  gender: booking.user?.gender ?? null,
  avatar: await resolveAvatarUrl(booking.user?.avatar),
  bookingStatus: booking.status,
  joinedAt: booking.createdAt,
});

const resolveMediaImageList = async (images?: string[] | null): Promise<string[]> => {
  if (!images || images.length === 0) {
    return [];
  }

  return resolveMediaUrls(images);
};

const mapPackage = async (tripPackage: any): Promise<PackageResponse> => {
  const [participants, hotelImages, vehicleImages] = await Promise.all([
    Promise.all(tripPackage.bookings.map(mapParticipant)),
    resolveMediaImageList(tripPackage.hotel?.images),
    resolveMediaImageList(tripPackage.vehicle?.images),
  ]);

  return {
    id: tripPackage.id,
    agencyId: tripPackage.agencyId,
    agencyName: tripPackage.agency.name,
    hotelId: tripPackage.hotelId ?? null,
    vehicleId: tripPackage.vehicleId ?? null,
    name: tripPackage.name,
    description: tripPackage.description,
    price: tripPackage.price,
    duration: tripPackage.duration,
    destinations: tripPackage.destinations,
    images: tripPackage.images,
    isActive: tripPackage.isActive,
    participantCount: participants.length,
    participants,
    hotel: tripPackage.hotel
        ? {
            id: tripPackage.hotel.id,
            name: tripPackage.hotel.name,
            city: tripPackage.hotel.city,
            country: tripPackage.hotel.country,
            rating: tripPackage.hotel.rating ?? null,
            image: hotelImages.length > 0 ? hotelImages[0] : null,
            images: hotelImages,
          }
        : null,
    vehicle: tripPackage.vehicle
        ? {
            id: tripPackage.vehicle.id,
            type: tripPackage.vehicle.type,
            make: tripPackage.vehicle.make,
            model: tripPackage.vehicle.model,
            capacity: tripPackage.vehicle.capacity,
            image: vehicleImages.length > 0 ? vehicleImages[0] : null,
            images: vehicleImages,
          }
        : null,
    createdAt: tripPackage.createdAt,
    updatedAt: tripPackage.updatedAt,
  };
};

export class PackagesService {
  private async assertInventoryOwnership(
    agencyId: string,
    inventory: { hotelId?: string | null; vehicleId?: string | null },
  ): Promise<void> {
    if (inventory.hotelId) {
      const hotel = await prisma.hotel.findFirst({
        where: {
          id: inventory.hotelId,
          agencyId,
        },
        select: { id: true },
      });

      if (!hotel) {
        throw new Error('Selected hotel was not found in your inventory');
      }
    }

    if (inventory.vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: inventory.vehicleId,
          agencyId,
        },
        select: { id: true },
      });

      if (!vehicle) {
        throw new Error('Selected vehicle was not found in your inventory');
      }
    }
  }

  async getPackages(
    filters: PackageFiltersInput,
    actor: { role: string; agencyId?: string },
  ): Promise<{ packages: PackageResponse[]; total: number; page: number; limit: number }> {
    const { page, limit, search, active } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (actor.role === ROLES.AGENCY) {
      where.agencyId = actor.agencyId;
    } else if (active !== undefined) {
      where.isActive = active;
    } else if (actor.role !== ROLES.ADMIN) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: packageInclude,
      }),
      prisma.package.count({ where }),
    ]);

    return {
      packages: await Promise.all(packages.map(mapPackage)),
      total,
      page,
      limit,
    };
  }

  async getPackageById(
    id: string,
    actor: { role: string; agencyId?: string },
  ): Promise<PackageResponse> {
    const where: any = { id };

    if (actor.role === ROLES.AGENCY) {
      where.agencyId = actor.agencyId;
    } else if (actor.role !== ROLES.ADMIN) {
      where.isActive = true;
    }

    const tripPackage = await prisma.package.findFirst({
      where,
      include: packageInclude,
    });

    if (!tripPackage) {
      throw new Error('Trip offer not found');
    }

    return mapPackage(tripPackage);
  }

  async createPackage(agencyId: string, input: CreatePackageInput): Promise<PackageResponse> {
    await this.assertInventoryOwnership(agencyId, {
      hotelId: input.hotelId ?? null,
      vehicleId: input.vehicleId ?? null,
    });

    const tripPackage = await prisma.package.create({
      data: {
        agencyId,
        hotelId: input.hotelId ?? null,
        vehicleId: input.vehicleId ?? null,
        name: input.name,
        description: input.description ?? null,
        price: input.price,
        duration: input.duration,
        destinations: input.destinations,
        images: input.images ?? [],
        isActive: input.isActive ?? true,
      },
      include: packageInclude,
    });

    emitOfferUpdated({
      eventType: 'CREATED',
      packageId: tripPackage.id,
      agencyId: tripPackage.agencyId,
      name: tripPackage.name,
      isActive: tripPackage.isActive,
      updatedAt: tripPackage.updatedAt.toISOString(),
    });

    return mapPackage(tripPackage);
  }

  async updatePackage(
    id: string,
    agencyId: string,
    input: UpdatePackageInput,
  ): Promise<PackageResponse> {
    const existing = await prisma.package.findFirst({
      where: { id, agencyId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error('Trip offer not found');
    }

    await this.assertInventoryOwnership(agencyId, {
      hotelId: input.hotelId,
      vehicleId: input.vehicleId,
    });

    const tripPackage = await prisma.package.update({
      where: { id },
      data: {
        ...(input.hotelId !== undefined ? { hotelId: input.hotelId ?? null } : {}),
        ...(input.vehicleId !== undefined ? { vehicleId: input.vehicleId ?? null } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description ?? null } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.duration !== undefined ? { duration: input.duration } : {}),
        ...(input.destinations !== undefined ? { destinations: input.destinations } : {}),
        ...(input.images !== undefined ? { images: input.images } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      include: packageInclude,
    });

    emitOfferUpdated({
      eventType: 'UPDATED',
      packageId: tripPackage.id,
      agencyId: tripPackage.agencyId,
      name: tripPackage.name,
      isActive: tripPackage.isActive,
      updatedAt: tripPackage.updatedAt.toISOString(),
    });

    return mapPackage(tripPackage);
  }

  async deletePackage(id: string, agencyId: string): Promise<void> {
    const existing = await prisma.package.findFirst({
      where: { id, agencyId },
      select: {
        id: true,
        agencyId: true,
        name: true,
        isActive: true,
        updatedAt: true,
      },
    });

    if (!existing) {
      throw new Error('Trip offer not found');
    }

    await prisma.package.delete({
      where: { id },
    });

    emitOfferUpdated({
      eventType: 'DELETED',
      packageId: existing.id,
      agencyId: existing.agencyId,
      name: existing.name,
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  }

  async applyToPackage(
    packageId: string,
    travelerId: string,
    input: ApplyPackageInput,
  ): Promise<{ bookingId: string }> {
    const tripPackage = await prisma.package.findFirst({
      where: {
        id: packageId,
        isActive: true,
      },
      select: {
        id: true,
        agencyId: true,
        price: true,
        duration: true,
      },
    });

    if (!tripPackage) {
      throw new Error('Trip offer not found');
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        packageId: tripPackage.id,
        userId: travelerId,
        status: {
          not: BOOKING_STATUS.CANCELLED,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingBooking) {
      throw new Error('You already joined this trip offer');
    }

    const startDate = new Date(input.startDate);
    if (Number.isNaN(startDate.getTime())) {
      throw new Error('A valid start date is required');
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.max(tripPackage.duration - 1, 0));

    const booking = await prisma.booking.create({
      data: {
        userId: travelerId,
        agencyId: tripPackage.agencyId,
        packageId: tripPackage.id,
        status: BOOKING_STATUS.PENDING,
        totalAmount: tripPackage.price,
        startDate,
        endDate,
      },
      select: { id: true },
    });

    return { bookingId: booking.id };
  }
}

export const packagesService = new PackagesService();
