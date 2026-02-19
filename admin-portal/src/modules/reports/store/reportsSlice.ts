import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardStats } from '../../../shared/types';
import {
  BookingsChartPoint,
  reportsService,
  RevenueChartPoint,
  UserGrowthPoint,
} from '../services/reportsService';

type ReportRange = '3months' | '6months' | '12months';

interface ReportsState {
  dashboardStats: DashboardStats | null;
  revenueData: RevenueChartPoint[];
  bookingsData: BookingsChartPoint[];
  userGrowthData: UserGrowthPoint[];
  range: ReportRange;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  dashboardStats: null,
  revenueData: [],
  bookingsData: [],
  userGrowthData: [],
  range: '6months',
  loading: false,
  error: null,
};

export const fetchReportDashboard = createAsyncThunk('reports/fetchDashboard', async () => {
  return reportsService.getDashboardStats();
});

export const fetchRevenueReport = createAsyncThunk(
  'reports/fetchRevenue',
  async (range: ReportRange = '6months') => {
    return reportsService.getRevenue(range);
  }
);

export const fetchBookingsReport = createAsyncThunk(
  'reports/fetchBookings',
  async (range: ReportRange = '6months') => {
    return reportsService.getBookings(range);
  }
);

export const fetchUserGrowthReport = createAsyncThunk(
  'reports/fetchUserGrowth',
  async (range: ReportRange = '6months') => {
    return reportsService.getUserGrowth(range);
  }
);

export const fetchAllReports = createAsyncThunk(
  'reports/fetchAll',
  async (range: ReportRange = '6months') => {
    const [dashboardStats, revenueData, bookingsData, userGrowthData] = await Promise.all([
      reportsService.getDashboardStats(),
      reportsService.getRevenue(range),
      reportsService.getBookings(range),
      reportsService.getUserGrowth(range),
    ]);

    return {
      dashboardStats,
      revenueData,
      bookingsData,
      userGrowthData,
      range,
    };
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReportRange: (state, action: PayloadAction<ReportRange>) => {
      state.range = action.payload;
    },
    clearReportsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReports.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.dashboardStats;
        state.revenueData = action.payload.revenueData;
        state.bookingsData = action.payload.bookingsData;
        state.userGrowthData = action.payload.userGrowthData;
        state.range = action.payload.range;
      })
      .addCase(fetchAllReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load reports';
      })
      .addCase(fetchReportDashboard.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.revenueData = action.payload;
      })
      .addCase(fetchBookingsReport.fulfilled, (state, action) => {
        state.bookingsData = action.payload;
      })
      .addCase(fetchUserGrowthReport.fulfilled, (state, action) => {
        state.userGrowthData = action.payload;
      });
  },
});

export const { setReportRange, clearReportsError } = reportsSlice.actions;
export type { ReportRange };
export default reportsSlice.reducer;
