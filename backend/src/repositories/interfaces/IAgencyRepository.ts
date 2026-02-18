import { Agency } from '@prisma/client';
import { IRepository } from './IRepository';

/**
 * Agency-specific filters
 */
export interface AgencyFilters {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * Agency with additional computed fields
 */
export interface AgencyWithCounts extends Agency {
    hotelsCount?: number;
    vehiclesCount?: number;
}

/**
 * Agency Repository Interface
 * Defines operations for managing Agency entities
 */
export interface IAgencyRepository extends IRepository<Agency> {
    /**
     * Find agencies with filters and pagination
     */
    findMany(filters: AgencyFilters): Promise<AgencyWithCounts[]>;

    /**
     * Count agencies with optional filters
     */
    count(filters?: Omit<AgencyFilters, 'page' | 'limit'>): Promise<number>;

    /**
     * Update agency status (approve/reject)
     */
    updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Agency>;

    /**
     * Find agency by email (for authentication)
     */
    findByEmail(email: string): Promise<Agency | null>;

    /**
     * Find agency by Firebase UID (for authentication)
     */
    findByFirebaseUid(firebaseUid: string): Promise<Agency | null>;
}
