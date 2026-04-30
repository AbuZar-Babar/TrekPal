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

const normalizeHotelIds = (hotelIds?: string[] | null, hotelId?: string | null): string[] => {
  const values = [...(hotelIds ?? []), ...(hotelId ? [hotelId] : [])].map((value) => value.trim());
  return Array.from(new Set(values.filter(Boolean)));
};

const mapPackage = async (tripPackage: any): Promise<PackageResponse> => {
  const normalizedHotelIds = normalizeHotelIds(tripPackage.hotelIds, tripPackage.hotelId);
  const [participants, hotelImages, vehicleImages, relatedHotels] = await Promise.all([
    Promise.all(tripPackage.bookings.map(mapParticipant)),
    resolveMediaImageList(tripPackage.hotel?.images),
    resolveMediaImageList(tripPackage.vehicle?.images),
    normalizedHotelIds.length > 0
      ? prisma.hotel.findMany({
          where: { id: { in: normalizedHotelIds } },
          select: { id: true, name: true, city: true, country: true, rating: true, images: true },
        })
      : Promise.resolve([]),
  ]);
  const confirmedSeats = participants.length;
  const maxSeats = tripPackage.maxSeats ?? 1;
  const remainingSeats = Math.max(0, maxSeats - confirmedSeats);

  return {
    id: tripPackage.id,
    agencyId: tripPackage.agencyId,
    agencyName: tripPackage.agency.name,
    hotelId: tripPackage.hotelId ?? null,
    hotelIds: normalizedHotelIds,
    vehicleId: tripPackage.vehicleId ?? null,
    name: tripPackage.name,
    description: tripPackage.description,
    price: tripPackage.price,
    duration: tripPackage.duration,
    startDate: tripPackage.startDate ?? null,
    maxSeats,
    confirmedSeats,
    remainingSeats,
    isSoldOut: remainingSeats <= 0,
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
    hotels: await Promise.all(
      relatedHotels.map(async (hotel: any) => {
        const images = await resolveMediaImageList(hotel.images);
        return {
          id: hotel.id,
          name: hotel.name,
          city: hotel.city,
          country: hotel.country,
          rating: hotel.rating ?? null,
          image: images.length > 0 ? images[0] : null,
          images,
        };
      }),
    ),
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
  private assertActiveOfferRequirements(input: {
    isActive?: boolean;
    hotelId?: string | null;
    hotelIds?: string[] | null;
    startDate?: Date | null;
  }): void {
    if (!input.isActive) {
      return;
    }

    const hasAnyHotel = normalizeHotelIds(input.hotelIds, input.hotelId).length > 0;
    if (!hasAnyHotel) {
      throw new Error('Active trip offer must include a hotel');
    }

    if (!input.startDate) {
      throw new Error('Active trip offer must include a start date');
    }
  }

  private async assertInventoryOwnership(
    agencyId: string,
    inventory: { hotelId?: string | null; hotelIds?: string[] | null; vehicleId?: string | null },
  ): Promise<void> {
    const hotelIds = normalizeHotelIds(inventory.hotelIds, inventory.hotelId);
    if (hotelIds.length > 0) {
      const foundHotels = await prisma.hotel.findMany({
        where: {
          id: { in: hotelIds },
          agencyId,
        },
        select: { id: true },
      });

      if (foundHotels.length !== hotelIds.length) {
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
    } else if (actor.role === ROLES.ADMIN) {
      if (active !== undefined) {
        where.isActive = active;
      }
    } else {
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
    const normalizedHotelIds = normalizeHotelIds(input.hotelIds, input.hotelId ?? null);
    this.assertActiveOfferRequirements({
      isActive: input.isActive,
      hotelId: normalizedHotelIds[0] ?? null,
      hotelIds: normalizedHotelIds,
      startDate: input.startDate,
    });

    await this.assertInventoryOwnership(agencyId, {
      hotelId: normalizedHotelIds[0] ?? null,
      hotelIds: normalizedHotelIds,
      vehicleId: input.vehicleId ?? null,
    });

    const tripPackage = await prisma.package.create({
      data: {
        agencyId,
        hotelId: normalizedHotelIds[0] ?? null,
        hotelIds: normalizedHotelIds,
        vehicleId: input.vehicleId ?? null,
        name: input.name,
        description: input.description ?? null,
        price: input.price,
        duration: input.duration,
        startDate: input.startDate,
        maxSeats: input.maxSeats ?? 1,
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
      select: { id: true, hotelId: true, hotelIds: true, startDate: true, isActive: true },
    });

    if (!existing) {
      throw new Error('Trip offer not found');
    }

    const existingHotelIds = normalizeHotelIds(existing.hotelIds, existing.hotelId ?? null);
    const nextHotelIds =
      input.hotelIds !== undefined || input.hotelId !== undefined
        ? normalizeHotelIds(input.hotelIds, input.hotelId ?? null)
        : existingHotelIds;

    this.assertActiveOfferRequirements({
      isActive: input.isActive ?? existing.isActive,
      hotelId: nextHotelIds[0] ?? null,
      hotelIds: nextHotelIds,
      startDate:
        input.startDate !== undefined
          ? (input.startDate ?? null)
          : (existing.startDate ?? null),
    });

    await this.assertInventoryOwnership(agencyId, {
      hotelId: nextHotelIds[0] ?? null,
      hotelIds: nextHotelIds,
      vehicleId: input.vehicleId,
    });

    const tripPackage = await prisma.package.update({
      where: { id },
      data: {
        ...(input.hotelId !== undefined || input.hotelIds !== undefined
          ? { hotelId: nextHotelIds[0] ?? null, hotelIds: nextHotelIds }
          : {}),
        ...(input.vehicleId !== undefined ? { vehicleId: input.vehicleId ?? null } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description ?? null } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.duration !== undefined ? { duration: input.duration } : {}),
        ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
        ...(input.maxSeats !== undefined ? { maxSeats: input.maxSeats } : {}),
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
    _input: ApplyPackageInput,
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
        startDate: true,
        hotelId: true,
        maxSeats: true,
      },
    });

    if (!tripPackage) {
      throw new Error('Trip offer not found');
    }

    const confirmedSeats = await prisma.booking.count({
      where: {
        packageId: tripPackage.id,
        status: BOOKING_STATUS.CONFIRMED,
      },
    });
    if (confirmedSeats >= tripPackage.maxSeats) {
      const error: any = new Error('This trip offer is sold out');
      error.code = 'OFFER_UNAVAILABLE';
      throw error;
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

    if (!tripPackage.startDate) {
      throw new Error('Trip date is not set for this offer');
    }

    const startDate = new Date(tripPackage.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.max(tripPackage.duration - 1, 0));

    const booking = await prisma.booking.create({
      data: {
        userId: travelerId,
        agencyId: tripPackage.agencyId,
        packageId: tripPackage.id,
        hotelId: tripPackage.hotelId,
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
