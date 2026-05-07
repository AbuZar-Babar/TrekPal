import apiClient from '../../../shared/services/apiClient';
import { PaginatedResponse, VehicleProvider } from '../../../shared/types';

export const vehicleProvidersService = {
  async getVehicleProviders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<VehicleProvider>> {
    const response = await apiClient.get('/admin/vehicle-providers', { params });
    const result = response.data.data || response.data;
    return {
      data: result.providers || [],
      total: result.total || 0,
      page: result.page || params?.page || 1,
      limit: result.limit || params?.limit || 20,
    };
  },

  async approveVehicleProvider(id: string, reason?: string): Promise<VehicleProvider> {
    const response = await apiClient.post(`/admin/vehicle-providers/${id}/approve`, { reason });
    return response.data.data;
  },

  async rejectVehicleProvider(id: string, reason?: string): Promise<VehicleProvider> {
    const response = await apiClient.post(`/admin/vehicle-providers/${id}/reject`, { reason });
    return response.data.data;
  },
};
