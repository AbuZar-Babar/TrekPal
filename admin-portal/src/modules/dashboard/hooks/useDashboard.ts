import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from '../../../shared/types';
import { dashboardService } from '../services/dashboardService';

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRevenueChart = () => {
  return useQuery({
    queryKey: ['dashboard', 'revenue-chart'],
    queryFn: () => dashboardService.getRevenueChartData(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBookingsChart = () => {
  return useQuery({
    queryKey: ['dashboard', 'bookings-chart'],
    queryFn: () => dashboardService.getBookingsChartData(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserGrowth = () => {
  return useQuery({
    queryKey: ['dashboard', 'user-growth'],
    queryFn: () => dashboardService.getUserGrowthData(),
    staleTime: 5 * 60 * 1000,
  });
};

