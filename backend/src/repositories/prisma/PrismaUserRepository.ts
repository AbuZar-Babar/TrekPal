import { User } from '@prisma/client';
import {
    IUserRepository,
    UserFilters,
    UserWithCounts,
} from '../interfaces/IUserRepository';
import { prisma } from '../../config/database';

/**
 * Prisma implementation of IUserRepository
 * Handles all database operations for User entities using Prisma
 */
export class PrismaUserRepository implements IUserRepository {
    async findMany(filters: UserFilters): Promise<UserWithCounts[]> {
        const { search, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        bookings: true,
                        tripRequests: true,
                    },
                },
            },
        });

        return users.map((user) => ({
            ...user,
            bookingsCount: user._count.bookings,
            tripRequestsCount: user._count.tripRequests,
        }));
    }

    async findById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    async create(data: Partial<User>): Promise<User> {
        return await prisma.user.create({
            data: data as any,
        });
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        return await prisma.user.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id },
        });
    }

    async count(filters?: Omit<UserFilters, 'page' | 'limit'>): Promise<number> {
        const where: any = {};
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { phone: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return await prisma.user.count({ where });
    }

    async countRecentRegistrations(days: number): Promise<number> {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return await prisma.user.count({
            where: {
                createdAt: {
                    gte: since,
                },
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { firebaseUid },
        });
    }
}
