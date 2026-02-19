import apiClient from '../../../shared/services/apiClient';
import { DashboardStats } from '../../../shared/types';

export interface RevenueChartPoint {
  month: string;
  revenue: number;
}

export interface BookingsChartPoint {
  month: string;
  bookings: number;
}

export interface UserGrowthPoint {
  month: string;
  users: number;
}

export const reportsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/admin/reports/dashboard');
    return response.data.data;
  },

  async getRevenue(range: string = '6months'): Promise<RevenueChartPoint[]> {
    const response = await apiClient.get('/admin/reports/revenue', {
      params: { range },
    });
    return response.data.data || [];
  },

  async getBookings(range: string = '6months'): Promise<BookingsChartPoint[]> {
    const response = await apiClient.get('/admin/reports/bookings', {
      params: { range },
    });
    return response.data.data || [];
  },

  async getUserGrowth(range: string = '6months'): Promise<UserGrowthPoint[]> {
    const response = await apiClient.get('/admin/reports/user-growth', {
      params: { range },
    });
    return response.data.data || [];
  },
};
