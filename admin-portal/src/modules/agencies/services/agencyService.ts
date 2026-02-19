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
    try {
      const response = await apiClient.get('/admin/agencies', { params });
      console.log('[Agency Service] Response:', response.data);

      // Handle response structure
      const result = response.data.data || response.data;

      // Check if result has agencies property
      if (result.agencies) {
        return {
          data: result.agencies,
          total: result.total,
          page: result.page,
          limit: result.limit,
        };
      }

      // If result is already an array (unlikely but handle it)
      if (Array.isArray(result)) {
        return {
          data: result,
          total: result.length,
          page: params?.page || 1,
          limit: params?.limit || 20,
        };
      }

      // Fallback
      console.error('[Agency Service] Unexpected response structure:', result);
      return {
        data: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 20,
      };
    } catch (error: any) {
      console.error('[Agency Service] Error fetching agencies:', error);
      throw error;
    }
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

  /**
   * Delete agency permanently
   */
  async deleteAgency(id: string): Promise<void> {
    await apiClient.delete(`/admin/agencies/${id}`);
  },
};

