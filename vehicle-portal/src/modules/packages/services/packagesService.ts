import apiClient from '../../../shared/services/apiClient';
import { Package, PaginatedResponse } from '../../../shared/types';

export const packagesService = {
  readError(error: any): string {
    return error.response?.data?.message || error.response?.data?.error || error.message || 'Request failed';
  },

  async getPackages(params?: {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
  }): Promise<PaginatedResponse<Package>> {
    const response = await apiClient.get('/packages', { params });
    const result = response.data.data;

    return {
      data: result.packages || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 20,
    };
  },

  async getPackageById(id: string): Promise<Package> {
    const response = await apiClient.get(`/packages/${id}`);
    return response.data.data;
  },

  async createPackage(data: {
    name: string;
    description?: string;
    price: number;
    duration: number;
    startDate: string;
    maxSeats?: number;
    hotelId?: string | null;
    hotelIds?: string[];
    hotelRoomPlan?: Array<{ hotelId: string; roomId: string; rooms: number }>;
    vehicleId?: string | null;
    destinations: string[];
    images?: string[];
    isActive?: boolean;
  }): Promise<Package> {
    try {
      const response = await apiClient.post('/packages', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(this.readError(error) || 'Failed to create trip offer');
    }
  },

  async updatePackage(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      duration?: number;
      startDate?: string;
      maxSeats?: number;
      hotelId?: string | null;
      hotelIds?: string[];
      hotelRoomPlan?: Array<{ hotelId: string; roomId: string; rooms: number }>;
      vehicleId?: string | null;
      destinations?: string[];
      images?: string[];
      isActive?: boolean;
    },
  ): Promise<Package> {
    try {
      const response = await apiClient.put(`/packages/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(this.readError(error) || 'Failed to update trip offer');
    }
  },

  async deletePackage(id: string): Promise<void> {
    try {
      await apiClient.delete(`/packages/${id}`);
    } catch (error: any) {
      throw new Error(this.readError(error) || 'Failed to delete trip offer');
    }
  },
};
