import { prisma } from '../../config/database';
import { APPROVAL_STATUS, BOOKING_STATUS, ROLES } from '../../config/constants';
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

type PackageRoomPlanEntry = {
  hotelId: string;
  roomId: string;
  rooms: number;
};

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
      createdAt: 'asc' as const,
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

const normalizeHotelRoomPlan = (
  hotelRoomPlan: Array<{ hotelId: string; roomId: string; rooms: number }> | null | undefined,
  hotelIds: string[],
): PackageRoomPlanEntry[] => {
  const byRoom = new Map<string, PackageRoomPlanEntry>();

  for (const entry of hotelRoomPlan ?? []) {
    const hotelId = entry.hotelId?.trim();
    const roomId = entry.roomId?.trim();
    if (!hotelId || !roomId || !hotelIds.includes(hotelId)) {
      continue;
    }

    const rooms = Number(entry.rooms);
    byRoom.set(roomId, {
      hotelId,
      roomId,
      rooms: Number.isFinite(rooms) && rooms > 0 ? Math.floor(rooms) : 1,
    });
  }

  return Array.from(byRoom.values()).sort((left, right) =>
    `${left.hotelId}:${left.roomId}`.localeCompare(`${right.hotelId}:${right.roomId}`),
  );
};

const normalizeStoredHotelRoomPlan = (
  hotelRoomPlan: unknown,
  hotelIds: string[],
): PackageRoomPlanEntry[] => {
  if (!Array.isArray(hotelRoomPlan)) {
    return [];
  }

  return normalizeHotelRoomPlan(hotelRoomPlan as Array<{ hotelId: string; roomId: string; rooms: number }>, hotelIds);
};

const computePackageCapacity = (maxSeats: number, hotelRoomPlan: PackageRoomPlanEntry[]): number => {
  if (hotelRoomPlan.length === 0) {
    return 0;
  }

  return Math.min(maxSeats, ...hotelRoomPlan.map((entry) => entry.rooms));
};

const getPackageReservationWindow = (
  startDate: Date | null | undefined,
  duration: number | null | undefined,
): { start: Date; endExclusive: Date; nights: number } | null => {
  if (!startDate || !duration || duration < 1) {
    return null;
  }

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const endExclusive = new Date(start);
  endExclusive.setDate(endExclusive.getDate() + duration);
  const nights = Math.ceil((endExclusive.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    return null;
  }

  return {
    start,
    endExclusive,
    nights,
  };
};

const buildHeldRoomPlan = (
  desiredRoomPlan: PackageRoomPlanEntry[],
  confirmedCount: number,
  isActive: boolean,
): PackageRoomPlanEntry[] => {
  if (isActive) {
    return desiredRoomPlan;
  }

  if (confirmedCount <= 0) {
    return [];
  }

  return desiredRoomPlan.map((entry) => ({
    ...entry,
    rooms: confirmedCount,
  }));
};

const mapPackage = async (tripPackage: any): Promise<PackageResponse> => {
  const normalizedHotelIds = normalizeHotelIds(tripPackage.hotelIds, tripPackage.hotelId);
  const normalizedRoomPlan = normalizeStoredHotelRoomPlan(tripPackage.hotelRoomPlan, normalizedHotelIds);
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
  const packageCapacity = computePackageCapacity(maxSeats, normalizedRoomPlan);
  const remainingSeats = Math.max(0, packageCapacity - confirmedSeats);

  return {
    id: tripPackage.id,
    agencyId: tripPackage.agencyId,
    agencyName: tripPackage.agency.name,
    hotelId: tripPackage.hotelId ?? null,
    hotelIds: normalizedHotelIds,
    hotelRoomPlan: normalizedRoomPlan,
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
  private buildAvailabilityError(message: string): Error & { code: string } {
    const error: Error & { code: string } = new Error(message) as Error & { code: string };
    error.code = 'ROOM_UNAVAILABLE';
    return error;
  }

  private assertActiveOfferRequirements(input: {
    isActive?: boolean;
    hotelId?: string | null;
    hotelIds?: string[] | null;
    startDate?: Date | null;
    hotelRoomPlan?: PackageRoomPlanEntry[];
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

    if (!input.hotelRoomPlan || input.hotelRoomPlan.length === 0) {
      throw new Error('Active trip offer must include at least one room allocation');
    }
  }

  private async assertSelectedHotelsOwnedByAgency(
    agencyId: string,
    hotelIds: string[],
    requireApproved: boolean,
  ): Promise<void> {
    if (hotelIds.length === 0) {
      return;
    }

    const hotels = await prisma.hotel.findMany({
      where: {
        id: { in: hotelIds },
        agencyId,
        ...(requireApproved ? { status: APPROVAL_STATUS.APPROVED } : {}),
      },
      select: { id: true },
    });

    if (hotels.length !== hotelIds.length) {
      throw new Error(
        requireApproved
          ? 'Selected hotel was not found in your approved inventory'
          : 'Selected hotel was not found in your inventory',
      );
    }
  }

  private async assertRoomPlanOwnedByAgency(
    agencyId: string,
    hotelIds: string[],
    hotelRoomPlan: PackageRoomPlanEntry[],
    requireApproved: boolean,
  ): Promise<void> {
    if (hotelRoomPlan.length === 0) {
      return;
    }

    const roomIds = hotelRoomPlan.map((entry) => entry.roomId);
    const rooms = await prisma.room.findMany({
      where: {
        id: { in: roomIds },
      },
      select: {
        id: true,
        hotelId: true,
        hotel: {
          select: {
            agencyId: true,
            status: true,
          },
        },
      },
    });

    if (rooms.length !== roomIds.length) {
      throw new Error('Selected room was not found in your inventory');
    }

    const roomsById = new Map(rooms.map((room) => [room.id, room]));
    for (const entry of hotelRoomPlan) {
      const room = roomsById.get(entry.roomId);
      if (!room) {
        throw new Error('Selected room was not found in your inventory');
      }

      if (room.hotelId !== entry.hotelId || !hotelIds.includes(entry.hotelId)) {
        throw new Error('Selected room does not belong to the chosen hotel');
      }

      if (room.hotel?.agencyId !== agencyId) {
        throw new Error('Selected room was not found in your inventory');
      }

      if (requireApproved && room.hotel?.status !== APPROVAL_STATUS.APPROVED) {
        throw new Error('Selected room must belong to an approved hotel');
      }
    }
  }

  private async assertVehicleOwnership(
    agencyId: string,
    vehicleId?: string | null,
  ): Promise<void> {
    if (!vehicleId) {
      return;
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        agencyId,
      },
      select: { id: true },
    });

    if (!vehicle) {
      throw new Error('Selected vehicle was not found in your inventory');
    }
  }

  private async reserveHeldRooms(
    tx: any,
    hotelRoomPlan: PackageRoomPlanEntry[],
    window: { start: Date; endExclusive: Date; nights: number },
  ): Promise<void> {
    for (const entry of hotelRoomPlan) {
      const availability = await tx.roomAvailability.findMany({
        where: {
          roomId: entry.roomId,
          date: {
            gte: window.start,
            lt: window.endExclusive,
          },
        },
        select: {
          available: true,
        },
      });

      if (
        availability.length < window.nights ||
        availability.some((slot: any) => slot.available < entry.rooms)
      ) {
        throw this.buildAvailabilityError('Selected room is no longer available for the requested dates');
      }

      const updated = await tx.roomAvailability.updateMany({
        where: {
          roomId: entry.roomId,
          date: {
            gte: window.start,
            lt: window.endExclusive,
          },
          available: {
            gte: entry.rooms,
          },
        },
        data: {
          available: {
            decrement: entry.rooms,
          },
        },
      });

      if (updated.count < window.nights) {
        throw this.buildAvailabilityError(
          'Selected room availability changed during reservation. Please retry.',
        );
      }
    }
  }

  private async releaseHeldRooms(
    tx: any,
    hotelRoomPlan: PackageRoomPlanEntry[],
    window: { start: Date; endExclusive: Date; nights: number },
  ): Promise<void> {
    for (const entry of hotelRoomPlan) {
      await tx.roomAvailability.updateMany({
        where: {
          roomId: entry.roomId,
          date: {
            gte: window.start,
            lt: window.endExclusive,
          },
        },
        data: {
          available: {
            increment: entry.rooms,
          },
        },
      });
    }
  }

  private async getHeldRoomPlan(tx: any, packageId: string): Promise<PackageRoomPlanEntry[]> {
    const allocations = await tx.packageRoomAllocation.findMany({
      where: { packageId },
      select: {
        roomId: true,
        reservedRooms: true,
        room: {
          select: {
            hotelId: true,
          },
        },
      },
      orderBy: {
        roomId: 'asc',
      },
    });

    return allocations.map((allocation: any) => ({
      hotelId: allocation.room.hotelId,
      roomId: allocation.roomId,
      rooms: allocation.reservedRooms,
    }));
  }

  private async replaceHeldRoomPlan(
    tx: any,
    packageId: string,
    hotelRoomPlan: PackageRoomPlanEntry[],
  ): Promise<void> {
    await tx.packageRoomAllocation.deleteMany({
      where: { packageId },
    });

    if (hotelRoomPlan.length === 0) {
      return;
    }

    await tx.packageRoomAllocation.createMany({
      data: hotelRoomPlan.map((entry) => ({
        packageId,
        roomId: entry.roomId,
        reservedRooms: entry.rooms,
      })),
    });
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
    const normalizedRoomPlan = normalizeHotelRoomPlan(input.hotelRoomPlan, normalizedHotelIds);
    this.assertActiveOfferRequirements({
      isActive: input.isActive,
      hotelId: normalizedHotelIds[0] ?? null,
      hotelIds: normalizedHotelIds,
      startDate: input.startDate,
      hotelRoomPlan: normalizedRoomPlan,
    });

    await this.assertSelectedHotelsOwnedByAgency(
      agencyId,
      normalizedHotelIds,
      Boolean(input.isActive ?? true),
    );
    await this.assertRoomPlanOwnedByAgency(
      agencyId,
      normalizedHotelIds,
      normalizedRoomPlan,
      Boolean(input.isActive ?? true),
    );
    await this.assertVehicleOwnership(agencyId, input.vehicleId ?? null);

    const heldRoomPlan = buildHeldRoomPlan(
      normalizedRoomPlan,
      0,
      Boolean(input.isActive ?? true),
    );
    const reservationWindow = getPackageReservationWindow(input.startDate ?? null, input.duration);

    const packageId = await prisma.$transaction(async (tx: any) => {
      if (heldRoomPlan.length > 0) {
        if (!reservationWindow) {
          throw new Error('Trip offer dates are invalid for room reservation');
        }

        await this.reserveHeldRooms(tx, heldRoomPlan, reservationWindow);
      }

      const createdPackage = await tx.package.create({
        data: {
          agencyId,
          hotelId: normalizedHotelIds[0] ?? null,
          hotelIds: normalizedHotelIds,
          hotelRoomPlan: normalizedRoomPlan,
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
        select: {
          id: true,
        },
      });

      await this.replaceHeldRoomPlan(tx, createdPackage.id, heldRoomPlan);

      return createdPackage.id;
    });

    const tripPackage = await prisma.package.findUnique({
      where: { id: packageId },
      include: packageInclude,
    });

    if (!tripPackage) {
      throw new Error('Trip offer not found after creation');
    }

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
      select: {
        id: true,
        hotelId: true,
        hotelIds: true,
        hotelRoomPlan: true,
        vehicleId: true,
        startDate: true,
        duration: true,
        isActive: true,
      },
    });

    if (!existing) {
      throw new Error('Trip offer not found');
    }

    const existingHotelIds = normalizeHotelIds(existing.hotelIds, existing.hotelId ?? null);
    const existingDesiredRoomPlan = normalizeStoredHotelRoomPlan(existing.hotelRoomPlan, existingHotelIds);
    const nextHotelIds =
      input.hotelIds !== undefined || input.hotelId !== undefined
        ? normalizeHotelIds(input.hotelIds, input.hotelId ?? null)
        : existingHotelIds;
    const nextDesiredRoomPlan =
      input.hotelRoomPlan !== undefined || input.hotelIds !== undefined || input.hotelId !== undefined
        ? normalizeHotelRoomPlan(input.hotelRoomPlan, nextHotelIds)
        : existingDesiredRoomPlan;
    const nextStartDate =
      input.startDate !== undefined ? (input.startDate ?? null) : (existing.startDate ?? null);
    const nextDuration = input.duration ?? existing.duration;
    const nextIsActive = input.isActive ?? existing.isActive;

    this.assertActiveOfferRequirements({
      isActive: nextIsActive,
      hotelId: nextHotelIds[0] ?? null,
      hotelIds: nextHotelIds,
      startDate: nextStartDate,
      hotelRoomPlan: nextDesiredRoomPlan,
    });

    await this.assertSelectedHotelsOwnedByAgency(agencyId, nextHotelIds, nextIsActive);
    await this.assertRoomPlanOwnedByAgency(agencyId, nextHotelIds, nextDesiredRoomPlan, nextIsActive);
    await this.assertVehicleOwnership(
      agencyId,
      input.vehicleId !== undefined ? input.vehicleId ?? null : existing.vehicleId ?? null,
    );

    const packageId = await prisma.$transaction(async (tx: any) => {
      await tx.$queryRaw`SELECT id FROM packages WHERE id = ${id} FOR UPDATE`;

      const confirmedCount = await tx.booking.count({
        where: {
          packageId: id,
          status: BOOKING_STATUS.CONFIRMED,
        },
      });

      const activeBookingCount = await tx.booking.count({
        where: {
          packageId: id,
          status: {
            in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
          },
        },
      });

      if (confirmedCount > 0) {
        if (nextDesiredRoomPlan.length === 0) {
          throw new Error('Trip offer must keep room allocations while confirmed travelers exist');
        }

        if (nextDesiredRoomPlan.some((entry) => entry.rooms < confirmedCount)) {
          throw new Error('Room allocations cannot be reduced below the confirmed traveler count');
        }
      }

      const currentHeldRoomPlan = await this.getHeldRoomPlan(tx, id);
      const oldWindow = getPackageReservationWindow(existing.startDate ?? null, existing.duration);
      const nextWindow = getPackageReservationWindow(nextStartDate, nextDuration);
      const nextHeldRoomPlan = buildHeldRoomPlan(nextDesiredRoomPlan, confirmedCount, nextIsActive);

      if (currentHeldRoomPlan.length > 0 && oldWindow) {
        await this.releaseHeldRooms(tx, currentHeldRoomPlan, oldWindow);
      }

      if (nextHeldRoomPlan.length > 0) {
        if (!nextWindow) {
          throw new Error('Trip offer dates are invalid for room reservation');
        }

        await this.reserveHeldRooms(tx, nextHeldRoomPlan, nextWindow);
      }

      if (activeBookingCount > 0 && nextWindow) {
        await tx.booking.updateMany({
          where: {
            packageId: id,
            status: {
              in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
            },
          },
          data: {
            hotelId: nextHotelIds[0] ?? null,
            startDate: nextWindow.start,
            endDate: nextWindow.endExclusive,
            ...(input.vehicleId !== undefined ? { vehicleId: input.vehicleId ?? null } : {}),
          },
        });
      } else if (input.vehicleId !== undefined) {
        await tx.booking.updateMany({
          where: {
            packageId: id,
            status: {
              in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
            },
          },
          data: {
            vehicleId: input.vehicleId ?? null,
          },
        });
      }

      await this.replaceHeldRoomPlan(tx, id, nextHeldRoomPlan);

      const updatedPackage = await tx.package.update({
        where: { id },
        data: {
          ...(input.hotelId !== undefined || input.hotelIds !== undefined || input.hotelRoomPlan !== undefined
            ? { hotelId: nextHotelIds[0] ?? null, hotelIds: nextHotelIds, hotelRoomPlan: nextDesiredRoomPlan }
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
        select: {
          id: true,
        },
      });

      return updatedPackage.id;
    });

    const tripPackage = await prisma.package.findUnique({
      where: { id: packageId },
      include: packageInclude,
    });

    if (!tripPackage) {
      throw new Error('Trip offer not found after update');
    }

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
        startDate: true,
        duration: true,
      },
    });

    if (!existing) {
      throw new Error('Trip offer not found');
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.$queryRaw`SELECT id FROM packages WHERE id = ${id} FOR UPDATE`;

      const activeBookings = await tx.booking.count({
        where: {
          packageId: id,
          status: {
            in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
          },
        },
      });

      if (activeBookings > 0) {
        throw new Error('Trip offers with pending or confirmed travelers cannot be deleted');
      }

      const currentHeldRoomPlan = await this.getHeldRoomPlan(tx, id);
      const reservationWindow = getPackageReservationWindow(existing.startDate ?? null, existing.duration);

      if (currentHeldRoomPlan.length > 0 && reservationWindow) {
        await this.releaseHeldRooms(tx, currentHeldRoomPlan, reservationWindow);
      }

      await tx.package.delete({
        where: { id },
      });
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
        vehicleId: true,
        maxSeats: true,
      },
    });

    if (!tripPackage) {
      throw new Error('Trip offer not found');
    }

    const roomAllocations = await prisma.packageRoomAllocation.findMany({
      where: {
        packageId: tripPackage.id,
      },
      select: {
        reservedRooms: true,
      },
    });
    const packageCapacity = roomAllocations.length
      ? Math.min(
          tripPackage.maxSeats,
          ...roomAllocations.map((allocation) => allocation.reservedRooms),
        )
      : 0;
    const confirmedSeats = await prisma.booking.count({
      where: {
        packageId: tripPackage.id,
        status: BOOKING_STATUS.CONFIRMED,
      },
    });
    if (confirmedSeats >= packageCapacity) {
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

    const reservationWindow = getPackageReservationWindow(tripPackage.startDate, tripPackage.duration);
    if (!reservationWindow) {
      throw new Error('Trip dates are invalid for this offer');
    }

    const booking = await prisma.booking.create({
      data: {
        userId: travelerId,
        agencyId: tripPackage.agencyId,
        packageId: tripPackage.id,
        hotelId: tripPackage.hotelId,
        vehicleId: tripPackage.vehicleId,
        status: BOOKING_STATUS.PENDING,
        totalAmount: tripPackage.price,
        startDate: reservationWindow.start,
        endDate: reservationWindow.endExclusive,
      },
      select: { id: true },
    });

    return { bookingId: booking.id };
  }
}

export const packagesService = new PackagesService();
