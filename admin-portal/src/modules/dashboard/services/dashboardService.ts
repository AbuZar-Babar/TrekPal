import { DashboardStats } from '../../../shared/types';

/**
 * Dashboard Service - Provides dummy analytics data
 */
export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return dummy analytics data
    return {
      totalUsers: 1247,
      totalAgencies: 48,
      approvedAgencies: 42,
      pendingAgencies: 6,
      totalHotels: 156,
      approvedHotels: 142,
      pendingHotels: 14,
      totalVehicles: 89,
      approvedVehicles: 78,
      pendingVehicles: 11,
      totalBookings: 3421,
      totalRevenue: 2847500,
      recentRegistrations: {
        users: 23,
        agencies: 3,
      },
    };
  },

  /**
   * Get revenue chart data (last 6 months)
   */
  async getRevenueChartData(): Promise<{ month: string; revenue: number }[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return [
      { month: 'Jul', revenue: 420000 },
      { month: 'Aug', revenue: 480000 },
      { month: 'Sep', revenue: 520000 },
      { month: 'Oct', revenue: 610000 },
      { month: 'Nov', revenue: 580000 },
      { month: 'Dec', revenue: 637500 },
    ];
  },

  /**
   * Get bookings chart data (last 6 months)
   */
  async getBookingsChartData(): Promise<{ month: string; bookings: number }[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return [
      { month: 'Jul', bookings: 512 },
      { month: 'Aug', bookings: 587 },
      { month: 'Sep', bookings: 634 },
      { month: 'Oct', bookings: 721 },
      { month: 'Nov', bookings: 689 },
      { month: 'Dec', bookings: 756 },
    ];
  },

  /**
   * Get user growth data (last 6 months)
   */
  async getUserGrowthData(): Promise<{ month: string; users: number }[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return [
      { month: 'Jul', users: 892 },
      { month: 'Aug', users: 945 },
      { month: 'Sep', users: 1023 },
      { month: 'Oct', users: 1105 },
      { month: 'Nov', users: 1187 },
      { month: 'Dec', users: 1247 },
    ];
  },
};

