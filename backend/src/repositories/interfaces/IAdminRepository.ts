import { Admin } from '@prisma/client';
import { IRepository } from './IRepository';

/**
 * Admin Repository Interface
 * Defines operations for managing Admin entities
 */
export interface IAdminRepository extends IRepository<Admin> {
    /**
     * Find admin by email
     */
    findByEmail(email: string): Promise<Admin | null>;

    /**
     * Find admin by Firebase UID
     */
    findByFirebaseUid(firebaseUid: string): Promise<Admin | null>;
}
