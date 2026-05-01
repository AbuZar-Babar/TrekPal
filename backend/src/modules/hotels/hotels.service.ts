import { prisma } from '../../config/database';
import { APPROVAL_STATUS } from '../../config/constants';
import {
  CreateHotelInput,
  HotelFiltersInput,
  HotelResponse,
  UpdateHotelInput,
} from './hotels.types';
import { normalizeMediaStoragePaths, resolveMediaUrls } from '../../services/media-storage.service';
import { roomAvailabilityService } from './room-availability.service';

const hotelSelect = {
  id: true,
  agencyId: true,
  authUid: true,
  name: true,
  description: true,
  address: true,
  city: true,
  country: true,
  latitude: true,
  longitude: true,
  rating: true,
  status: true,
  images: true,
  amenities: true,
  businessDocUrl: true,
  locationImageUrl: true,
  createdAt: true,
  updatedAt: true,
  email: true,
  phone: true,
  rooms: {
    select: {
      id: true,
      type: true,
      price: true,
      capacity: true,
      quantity: true,
      amenities: true,
      images: true,
    },
  },
  services: {
    select: {
      id: true,
      name: true,
      price: true,
    },
  },
} as const;

const mapHotel = async (
  hotel: any,
  availabilityWindow?: { start: Date; end: Date } | null,
): Promise<HotelResponse> => {
  const defaultDate = new Date();
  defaultDate.setHours(0, 0, 0, 0);

  const roomsWithAvailability = await Promise.all(
    (hotel.rooms || []).map(async (room: any) => {
      let availableQuantity: number;

      if (availabilityWindow) {
        const availabilities = await prisma.roomAvailability.findMany({
          where: {
            roomId: room.id,
            date: {
              gte: availabilityWindow.start,
              lt: availabilityWindow.end,
            },
          },
          select: {
            available: true,
          },
        });

        if (availabilities.length === 0) {
          availableQuantity = room.quantity ?? 0;
        } else {
          availableQuantity = Math.min(...availabilities.map((slot: any) => slot.available));
        }
      } else {
        const availability = await prisma.roomAvailability.findUnique({
          where: {
            roomId_date: {
              roomId: room.id,
              date: defaultDate,
            },
          },
          select: {
            available: true,
          },
        });

        availableQuantity = availability?.available ?? room.quantity ?? 0;
      }

      return {
        ...room,
        availableQuantity,
      };
    }),
  );

  return {
    id: hotel.id,
    agencyId: hotel.agencyId,
    authUid: hotel.authUid,
    name: hotel.name,
    description: hotel.description,
    address: hotel.address,
    city: hotel.city,
    country: hotel.country,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    rating: hotel.rating,
    status: hotel.status,
    images: await resolveMediaUrls(hotel.images),
    amenities: hotel.amenities,
    businessDocUrl: hotel.businessDocUrl,
    locationImageUrl: hotel.locationImageUrl,
    email: hotel.email,
    phone: hotel.phone,
    createdAt: hotel.createdAt,
    updatedAt: hotel.updatedAt,
    rooms: roomsWithAvailability,
    services: hotel.services || [],
  };
};

export class HotelsService {
  async getHotels(
    filters: HotelFiltersInput,
    actor: { role: string; agencyId?: string; authUid?: string }
  ): Promise<{ hotels: HotelResponse[]; total: number; page: number; limit: number }> {
    const { page, limit, status, search, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Logic for finding hotels:
    // 1. If it's a HOTEL role, show only their own hotel
    // 2. If it's an AGENCY role and not discovery, show only their own hotels
    // 3. If discovery is true, show all APPROVED hotels
    if (actor.role === 'HOTEL') {
      where.authUid = actor.authUid;
    } else if (actor.role === 'AGENCY' && !filters.discovery) {
      where.agencyId = actor.agencyId;
    }

    if (filters.discovery) {
      where.status = APPROVAL_STATUS.APPROVED;
    } else if (status) {
      where.status = status;
    } else if (actor.role !== 'AGENCY' && actor.role !== 'HOTEL') {
      where.status = APPROVAL_STATUS.APPROVED;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    let availabilityWindow: { start: Date; end: Date } | null = null;
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);

      if (end > start) {
        availabilityWindow = { start, end };
      }
    }

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: hotelSelect,
      }),
      prisma.hotel.count({ where }),
    ]);

    return {
      hotels: await Promise.all(hotels.map((hotel) => mapHotel(hotel, availabilityWindow))),
      total,
      page,
      limit,
    };
  }

  async getHotelById(id: string, actor: { role: string; agencyId?: string; authUid?: string }): Promise<HotelResponse> {
    const where: any = { id };

    if (actor.role === 'AGENCY') {
      // Agencies can see any hotel if it's approved (discovery) or if they own it
      // But for "My Inventory", they should only see theirs. 
      // This generic getById usually is for details, so we allow seeing any if approved.
      const hotel = await prisma.hotel.findUnique({ where, select: hotelSelect });
      if (!hotel) throw new Error('Hotel not found');
      
      const isOwner = hotel.agencyId === actor.agencyId;
      const isApproved = hotel.status === APPROVAL_STATUS.APPROVED;
      
      if (!isOwner && !isApproved) {
        throw new Error('Unauthorized');
      }
      return await mapHotel(hotel);
    }

    if (actor.role === 'HOTEL') {
      where.authUid = actor.authUid;
    }

    const hotel = await prisma.hotel.findFirst({
      where,
      select: hotelSelect,
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    return await mapHotel(hotel);
  }

  async createHotel(agencyId: string | null, input: CreateHotelInput, authUid?: string): Promise<HotelResponse> {
    const hotel = await prisma.hotel.create({
      data: {
        agencyId: agencyId || null,
        authUid: authUid || null,
        name: input.name,
        description: input.description ?? null,
        address: input.address,
        city: input.city,
        country: input.country,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        images: normalizeMediaStoragePaths(input.images ?? []),
        amenities: input.amenities ?? [],
        businessDocUrl: input.businessDocUrl ?? null,
        locationImageUrl: input.locationImageUrl ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        status: agencyId ? APPROVAL_STATUS.APPROVED : APPROVAL_STATUS.PENDING, // Hotels signed up by self need admin approval
      },
      select: hotelSelect,
    });

    return await mapHotel(hotel);
  }

  async updateHotel(id: string, input: UpdateHotelInput): Promise<HotelResponse> {
    const hotel = await prisma.hotel.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description ?? null } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.country !== undefined ? { country: input.country } : {}),
        ...(input.latitude !== undefined ? { latitude: input.latitude ?? null } : {}),
        ...(input.longitude !== undefined ? { longitude: input.longitude ?? null } : {}),
        ...(input.images !== undefined ? { images: normalizeMediaStoragePaths(input.images) } : {}),
        ...(input.amenities !== undefined ? { amenities: input.amenities } : {}),
        ...(input.email !== undefined ? { email: input.email ?? null } : {}),
        ...(input.phone !== undefined ? { phone: input.phone ?? null } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
      select: hotelSelect,
    });

    return await mapHotel(hotel);
  }

  async deleteHotel(id: string): Promise<void> {
    await prisma.hotel.delete({
      where: { id },
    });
  }

  // --- Room Management ---

  async addRoom(hotelId: string, input: any) {
    const room = await prisma.room.create({
      data: {
        hotelId,
        type: input.type,
        price: input.price,
        capacity: input.capacity,
        quantity: input.quantity,
        amenities: input.amenities ?? [],
        images: normalizeMediaStoragePaths(input.images ?? []),
      },
    });

    // Initialize availability
    await roomAvailabilityService.initializeAvailability(room.id, room.quantity);
    return room;
  }

  async updateRoom(roomId: string, input: any) {
    const oldRoom = await prisma.room.findUnique({ where: { id: roomId } });
    if (!oldRoom) throw new Error('Room not found');

    const room = await prisma.room.update({
      where: { id: roomId },
      data: {
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
        ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
        ...(input.amenities !== undefined ? { amenities: input.amenities } : {}),
        ...(input.images !== undefined ? { images: normalizeMediaStoragePaths(input.images) } : {}),
      },
    });

    // If quantity changed, re-initialize availability
    // Note: In a production app, we'd need to be careful not to overwrite booked slots
    // For now, we'll just update the total available count for future dates
    if (input.quantity !== undefined && input.quantity !== oldRoom.quantity) {
      await roomAvailabilityService.initializeAvailability(room.id, room.quantity);
    }

    return room;
  }

  async deleteRoom(roomId: string) {
    await prisma.room.delete({ where: { id: roomId } });
  }

  // --- Service Management ---

  async addService(hotelId: string, input: any) {
    return await prisma.hotelService.create({
      data: {
        hotelId,
        name: input.name,
        price: input.price ?? 0,
      },
    });
  }

  async updateService(serviceId: string, input: any) {
    return await prisma.hotelService.update({
      where: { id: serviceId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
      },
    });
  }

  async deleteService(serviceId: string) {
    await prisma.hotelService.delete({ where: { id: serviceId } });
  }
}

export const hotelsService = new HotelsService();
