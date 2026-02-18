import { Agency } from '@prisma/client';
import {
    IAgencyRepository,
    AgencyFilters,
    AgencyWithCounts,
} from '../interfaces/IAgencyRepository';
import { prisma } from '../../config/database';
import { APPROVAL_STATUS } from '../../config/constants';

/**
 * Prisma implementation of IAgencyRepository
 * Handles all database operations for Agency entities using Prisma
 */
export class PrismaAgencyRepository implements IAgencyRepository {
    async findMany(filters: AgencyFilters): Promise<AgencyWithCounts[]> {
        const { status, search, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { license: { contains: search, mode: 'insensitive' } },
            ];
        }

        const agencies = await prisma.agency.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        hotels: true,
                        vehicles: true,
                    },
                },
            },
        });

        return agencies.map((agency) => ({
            ...agency,
            hotelsCount: agency._count.hotels,
            vehiclesCount: agency._count.vehicles,
        }));
    }

    async findById(id: string): Promise<Agency | null> {
        return await prisma.agency.findUnique({
            where: { id },
        });
    }

    async create(data: Partial<Agency>): Promise<Agency> {
        return await prisma.agency.create({
            data: data as any,
        });
    }

    async update(id: string, data: Partial<Agency>): Promise<Agency> {
        return await prisma.agency.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.agency.delete({
            where: { id },
        });
    }

    async count(filters?: Omit<AgencyFilters, 'page' | 'limit'>): Promise<number> {
        const where: any = {};
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { license: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return await prisma.agency.count({ where });
    }

    async updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Agency> {
        return await prisma.agency.update({
            where: { id },
            data: { status },
        });
    }

    async findByEmail(email: string): Promise<Agency | null> {
        return await prisma.agency.findUnique({
            where: { email },
        });
    }

    async findByFirebaseUid(firebaseUid: string): Promise<Agency | null> {
        return await prisma.agency.findUnique({
            where: { firebaseUid },
        });
    }
}
