import { Vehicle } from '@prisma/client';
import { IRepository } from './IRepository';

/**
 * Vehicle-specific filters
 */
export interface VehicleFilters {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * Vehicle with additional computed fields
 */
export interface VehicleWithRelations extends Vehicle {
    agencyName?: string;
}

/**
 * Vehicle Repository Interface
 * Defines operations for managing Vehicle entities
 */
export interface IVehicleRepository extends IRepository<Vehicle> {
    /**
     * Find vehicles with filters and pagination
     */
    findMany(filters: VehicleFilters): Promise<VehicleWithRelations[]>;

    /**
     * Count vehicles with optional filters
     */
    count(filters?: Omit<VehicleFilters, 'page' | 'limit'>): Promise<number>;

    /**
     * Update vehicle status (approve/reject)
     */
    updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Vehicle>;
}
