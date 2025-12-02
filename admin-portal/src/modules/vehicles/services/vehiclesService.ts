import apiClient from '../../../shared/services/apiClient';
import { Vehicle, PaginatedResponse } from '../../../shared/types';

/**
 * Vehicles Service
 */
export const vehiclesService = {
  /**
   * Get all vehicles
   */
  async getVehicles(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Vehicle>> {
    const response = await apiClient.get('/admin/vehicles', { params });
    const result = response.data.data;
    // Backend returns { vehicles, total, page, limit }, convert to { data, total, page, limit }
    return {
      data: result.vehicles,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  },

  /**
   * Approve vehicle
   */
  async approveVehicle(id: string, reason?: string): Promise<Vehicle> {
    const response = await apiClient.post(`/admin/vehicles/${id}/approve`, {
      reason,
    });
    return response.data.data;
  },

  /**
   * Reject vehicle
   */
  async rejectVehicle(id: string, reason?: string): Promise<Vehicle> {
    const response = await apiClient.post(`/admin/vehicles/${id}/reject`, {
      reason,
    });
    return response.data.data;
  },
};
