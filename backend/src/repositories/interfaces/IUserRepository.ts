import { User } from '@prisma/client';
import { IRepository } from './IRepository';

/**
 * User-specific filters
 */
export interface UserFilters {
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * User with additional computed fields
 */
export interface UserWithCounts extends User {
    bookingsCount?: number;
    tripRequestsCount?: number;
}

/**
 * User Repository Interface
 * Defines operations for managing User entities
 */
export interface IUserRepository extends IRepository<User> {
    /**
     * Find users with filters and pagination
     */
    findMany(filters: UserFilters): Promise<UserWithCounts[]>;

    /**
     * Count users with optional filters
     */
    count(filters?: Omit<UserFilters, 'page' | 'limit'>): Promise<number>;

    /**
     * Get users registered in the last N days
     */
    countRecentRegistrations(days: number): Promise<number>;

    /**
     * Find user by email (for authentication)
     */
    findByEmail(email: string): Promise<User | null>;

    /**
     * Find user by Firebase UID (for authentication)
     */
    findByFirebaseUid(firebaseUid: string): Promise<User | null>;
}
