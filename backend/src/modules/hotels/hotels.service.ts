import { prisma } from '../../config/database';
import { APPROVAL_STATUS } from '../../config/constants';
import {
  CreateHotelInput,
  HotelFiltersInput,
  HotelResponse,
  UpdateHotelInput,
} from './hotels.types';

const hotelSelect = {
  id: true,
  agencyId: true,
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
  createdAt: true,
  updatedAt: true,
} as const;

const mapHotel = (hotel: any): HotelResponse => ({
  id: hotel.id,
  agencyId: hotel.agencyId,
  name: hotel.name,
  description: hotel.description,
  address: hotel.address,
  city: hotel.city,
  country: hotel.country,
  latitude: hotel.latitude,
  longitude: hotel.longitude,
  rating: hotel.rating,
  status: hotel.status,
  images: hotel.images,
  amenities: hotel.amenities,
  createdAt: hotel.createdAt,
  updatedAt: hotel.updatedAt,
});

export class HotelsService {
  async getHotels(
    filters: HotelFiltersInput,
    actor: { role: string; agencyId?: string }
  ): Promise<{ hotels: HotelResponse[]; total: number; page: number; limit: number }> {
    const { page, limit, status, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (actor.role === 'AGENCY') {
      where.agencyId = actor.agencyId;
    }

    if (status) {
      where.status = status;
    } else if (actor.role !== 'AGENCY') {
      where.status = APPROVAL_STATUS.APPROVED;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
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
      hotels: hotels.map(mapHotel),
      total,
      page,
      limit,
    };
  }

  async getHotelById(id: string, actor: { role: string; agencyId?: string }): Promise<HotelResponse> {
    const where: any = { id };

    if (actor.role === 'AGENCY') {
      where.agencyId = actor.agencyId;
    }

    const hotel = await prisma.hotel.findFirst({
      where,
      select: hotelSelect,
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    return mapHotel(hotel);
  }

  async createHotel(agencyId: string, input: CreateHotelInput): Promise<HotelResponse> {
    const hotel = await prisma.hotel.create({
      data: {
        agencyId,
        name: input.name,
        description: input.description ?? null,
        address: input.address,
        city: input.city,
        country: input.country,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        images: input.images ?? [],
        amenities: input.amenities ?? [],
        status: APPROVAL_STATUS.APPROVED,
      },
      select: hotelSelect,
    });

    return mapHotel(hotel);
  }

  async updateHotel(id: string, agencyId: string, input: UpdateHotelInput): Promise<HotelResponse> {
    const existing = await prisma.hotel.findFirst({
      where: { id, agencyId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error('Hotel not found');
    }

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
        ...(input.images !== undefined ? { images: input.images } : {}),
        ...(input.amenities !== undefined ? { amenities: input.amenities } : {}),
        status: APPROVAL_STATUS.APPROVED,
      },
      select: hotelSelect,
    });

    return mapHotel(hotel);
  }

  async deleteHotel(id: string, agencyId: string): Promise<void> {
    const existing = await prisma.hotel.findFirst({
      where: { id, agencyId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error('Hotel not found');
    }

    await prisma.hotel.delete({
      where: { id },
    });
  }
}

export const hotelsService = new HotelsService();
