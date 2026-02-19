import apiClient from '../../../shared/services/apiClient';
import { PaginatedResponse, UserProfile } from '../../../shared/types';

export const usersService = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
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
};
