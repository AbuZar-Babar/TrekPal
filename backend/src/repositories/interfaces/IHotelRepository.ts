import { Hotel } from '@prisma/client';
import { IRepository } from './IRepository';

/**
 * Hotel-specific filters
 */
export interface HotelFilters {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * Hotel with additional computed fields
 */
export interface HotelWithRelations extends Hotel {
    agencyName?: string;
    roomsCount?: number;
}

/**
 * Hotel Repository Interface
 * Defines operations for managing Hotel entities
 */
export interface IHotelRepository extends IRepository<Hotel> {
    /**
     * Find hotels with filters and pagination
     */
    findMany(filters: HotelFilters): Promise<HotelWithRelations[]>;

    /**
     * Count hotels with optional filters
     */
    count(filters?: Omit<HotelFilters, 'page' | 'limit'>): Promise<number>;

    /**
     * Update hotel status (approve/reject)
     */
    updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Hotel>;
}
