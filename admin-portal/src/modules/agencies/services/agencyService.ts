import apiClient from '../../../shared/services/apiClient';
import { Agency, PaginatedResponse } from '../../../shared/types';

/**
 * Agency Service
 */
export const agencyService = {
  /**
   * Get all agencies
   */
  async getAgencies(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Agency>> {
    const response = await apiClient.get('/admin/agencies', { params });
    const result = response.data.data;
    // Backend returns { agencies, total, page, limit }, convert to { data, total, page, limit }
    return {
      data: result.agencies,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  },

  /**
   * Approve agency
   */
  async approveAgency(id: string, reason?: string): Promise<Agency> {
    const response = await apiClient.post(`/admin/agencies/${id}/approve`, {
      reason,
    });
    return response.data.data;
  },

  /**
   * Reject agency
   */
  async rejectAgency(id: string, reason?: string): Promise<Agency> {
    const response = await apiClient.post(`/admin/agencies/${id}/reject`, {
      reason,
    });
    return response.data.data;
  },
};

