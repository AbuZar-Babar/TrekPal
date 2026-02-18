import apiClient from '../../../shared/services/apiClient';
import { DashboardStats } from '../../../shared/types';

/**
 * Dashboard Service - Fetches real analytics data from PostgreSQL via backend API
 * 
 * FIXED: Previously returned hardcoded dummy data
 * NOW: Calls backend API endpoints that query PostgreSQL database
 */
export const dashboardService = {
  /**
   * Get dashboard statistics from backend
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get('/admin/reports/dashboard');
      return response.data.data;
    } catch (error: any) {
      console.error('[Dashboard Service] Error fetching stats:', error);
      throw error;
    }
  },

  /**
   * Get revenue chart data (last 6 months) from backend
   */
  async getRevenueChartData(): Promise<{ month: string; revenue: number }[]> {
    try {
      const response = await apiClient.get('/admin/reports/revenue', {
        params: { range: '6months' },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('[Dashboard Service] Error fetching revenue chart:', error);
      // Return empty dataset on error (graceful degradation)
      return [];
    }
  },

  /**
   * Get bookings chart data (last 6 months) from backend
   */
  async getBookingsChartData(): Promise<{ month: string; bookings: number }[]> {
    try {
      const response = await apiClient.get('/admin/reports/bookings', {
        params: { range: '6months' },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('[Dashboard Service] Error fetching bookings chart:', error);
      // Return empty dataset on error (graceful degradation)
      return [];
    }
  },

  /**
   * Get user growth data (last 6 months) from backend
   */
  async getUserGrowthData(): Promise<{ month: string; users: number }[]> {
    try {
      const response = await apiClient.get('/admin/reports/user-growth', {
        params: { range: '6months' },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('[Dashboard Service] Error fetching user growth:', error);
      // Return empty dataset on error (graceful degradation)
      return [];
    }
  },
};

