import { Vehicle } from '@prisma/client';
import {
    IVehicleRepository,
    VehicleFilters,
    VehicleWithRelations,
} from '../interfaces/IVehicleRepository';
import { prisma } from '../../config/database';

/**
 * Prisma implementation of IVehicleRepository
 * Handles all database operations for Vehicle entities using Prisma
 */
export class PrismaVehicleRepository implements IVehicleRepository {
    async findMany(filters: VehicleFilters): Promise<VehicleWithRelations[]> {
        const { status, search, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};
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

        const vehicles = await prisma.vehicle.findMany({
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
        });

        return vehicles.map((vehicle) => ({
            ...vehicle,
            agencyName: vehicle.agency.name,
        }));
    }

    async findById(id: string): Promise<Vehicle | null> {
        return await prisma.vehicle.findUnique({
            where: { id },
        });
    }

    async create(data: Partial<Vehicle>): Promise<Vehicle> {
        return await prisma.vehicle.create({
            data: data as any,
        });
    }

    async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
        return await prisma.vehicle.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.vehicle.delete({
            where: { id },
        });
    }

    async count(filters?: Omit<VehicleFilters, 'page' | 'limit'>): Promise<number> {
        const where: any = {};
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.search) {
            where.OR = [
                { make: { contains: filters.search, mode: 'insensitive' } },
                { model: { contains: filters.search, mode: 'insensitive' } },
                { type: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return await prisma.vehicle.count({ where });
    }

    async updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Vehicle> {
        return await prisma.vehicle.update({
            where: { id },
            data: { status },
        });
    }
}
