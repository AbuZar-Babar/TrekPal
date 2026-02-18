import { Hotel } from '@prisma/client';
import {
    IHotelRepository,
    HotelFilters,
    HotelWithRelations,
} from '../interfaces/IHotelRepository';
import { prisma } from '../../config/database';

/**
 * Prisma implementation of IHotelRepository
 * Handles all database operations for Hotel entities using Prisma
 */
export class PrismaHotelRepository implements IHotelRepository {
    async findMany(filters: HotelFilters): Promise<HotelWithRelations[]> {
        const { status, search, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ];
        }

        const hotels = await prisma.hotel.findMany({
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
                _count: {
                    select: {
                        rooms: true,
                    },
                },
            },
        });

        return hotels.map((hotel) => ({
            ...hotel,
            agencyName: hotel.agency.name,
            roomsCount: hotel._count.rooms,
        }));
    }

    async findById(id: string): Promise<Hotel | null> {
        return await prisma.hotel.findUnique({
            where: { id },
        });
    }

    async create(data: Partial<Hotel>): Promise<Hotel> {
        return await prisma.hotel.create({
            data: data as any,
        });
    }

    async update(id: string, data: Partial<Hotel>): Promise<Hotel> {
        return await prisma.hotel.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.hotel.delete({
            where: { id },
        });
    }

    async count(filters?: Omit<HotelFilters, 'page' | 'limit'>): Promise<number> {
        const where: any = {};
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { city: { contains: filters.search, mode: 'insensitive' } },
                { address: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return await prisma.hotel.count({ where });
    }

    async updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Hotel> {
        return await prisma.hotel.update({
            where: { id },
            data: { status },
        });
    }
}
