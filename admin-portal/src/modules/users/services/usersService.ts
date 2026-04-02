import apiClient from '../../../shared/services/apiClient';
import {
  PaginatedResponse,
  TravelerUpdateInput,
  UserProfile,
} from '../../../shared/types';

export const usersService = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<UserProfile>> {
    const response = await apiClient.get('/admin/users', { params });
    const result = response.data.data;

    return {
      data: result.users || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 20,
    };
  },

  async approveUser(id: string, reason?: string): Promise<UserProfile> {
    const response = await apiClient.post(`/admin/users/${id}/approve`, {
      reason,
    });
    return response.data.data;
  },

  async rejectUser(id: string, reason?: string): Promise<UserProfile> {
    const response = await apiClient.post(`/admin/users/${id}/reject`, {
      reason,
    });
    return response.data.data;
  },

  async updateUser(id: string, payload: TravelerUpdateInput): Promise<UserProfile> {
    const response = await apiClient.patch(`/admin/users/${id}`, payload);
    return response.data.data;
  },
};
