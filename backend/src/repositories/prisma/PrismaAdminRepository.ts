import { Admin } from '@prisma/client';
import { IAdminRepository } from '../interfaces/IAdminRepository';
import { prisma } from '../../config/database';

/**
 * Prisma implementation of IAdminRepository
 */
export class PrismaAdminRepository implements IAdminRepository {
    async findMany(filters?: any): Promise<Admin[]> {
        return await prisma.admin.findMany(filters);
    }

    async findById(id: string): Promise<Admin | null> {
        return await prisma.admin.findUnique({
            where: { id },
        });
    }

    async findByEmail(email: string): Promise<Admin | null> {
        return await prisma.admin.findUnique({
            where: { email },
        });
    }

    async findByFirebaseUid(firebaseUid: string): Promise<Admin | null> {
        return await prisma.admin.findUnique({
            where: { firebaseUid },
        });
    }

    async create(data: Partial<Admin>): Promise<Admin> {
        return await prisma.admin.create({
            data: data as any,
        });
    }

    async update(id: string, data: Partial<Admin>): Promise<Admin> {
        return await prisma.admin.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.admin.delete({
            where: { id },
        });
    }

    async count(filters?: any): Promise<number> {
        return await prisma.admin.count(filters);
    }
}
