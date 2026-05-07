import apiClient from '../../../shared/services/apiClient';
import { Vehicle, PaginatedResponse } from '../../../shared/types';

/**
 * Transport Service
 */
export const transportService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiClient.post('/transport/upload-image', formData);
      return response.data.data.url;
    } catch (error: any) {
      const serverError = error.response?.data?.error || error.response?.data?.message;
      throw new Error(serverError || 'Failed to upload vehicle image');
    }
  },

  /**
   * Get all vehicles for the agency
   */
  async getVehicles(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Vehicle>> {
    const response = await apiClient.get('/transport/my-vehicles', { params });
    const result = response.data.data;
    return {
      data: result.vehicles,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  },

  /**
   * Get vehicle by ID
   */
  async getVehicleById(id: string): Promise<Vehicle> {
    const response = await apiClient.get(`/transport/${id}`);
    return response.data.data;
  },

  /**
   * Create a new vehicle
   */
  async createVehicle(data: {
    type: string;
    make: string;
    model: string;
    year: number;
    capacity: number;
    pricePerDay: number;
    images?: string[];
    isAvailable?: boolean;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    driverLicense?: string;
  }): Promise<Vehicle> {
    const response = await apiClient.post('/transport', data);
    return response.data.data;
  },

  /**
   * Update vehicle
   */
  async updateVehicle(
    id: string,
    data: {
      type?: string;
      make?: string;
      model?: string;
      year?: number;
      capacity?: number;
      pricePerDay?: number;
      images?: string[];
      isAvailable?: boolean;
      vehicleNumber?: string;
      driverName?: string;
      driverPhone?: string;
      driverLicense?: string;
    }
  ): Promise<Vehicle> {
    const response = await apiClient.put(`/transport/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete vehicle
   */
  async deleteVehicle(id: string): Promise<void> {
    await apiClient.delete(`/transport/${id}`);
  },
};
