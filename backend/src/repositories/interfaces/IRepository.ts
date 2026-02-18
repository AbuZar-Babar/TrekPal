/**
 * Base Repository Interface
 * Generic interface for database operations
 * 
 * @template T - The entity type
 * @template TCreate - The create DTO type
 * @template TUpdate - The update DTO type
 */
export interface IRepository<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  /**
   * Find multiple entities based on filters
   */
  findMany(filters?: any): Promise<T[]>;

  /**
   * Find a single entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Create a new entity
   */
  create(data: TCreate): Promise<T>;

  /**
   * Update an entity by ID
   */
  update(id: string, data: TUpdate): Promise<T>;

  /**
   * Delete an entity by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Count entities based on filters
   */
  count(filters?: any): Promise<number>;
}
