import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import {
  clearReportsError,
  fetchAllReports,
  fetchBookingsReport,
  fetchReportDashboard,
  fetchRevenueReport,
  fetchUserGrowthReport,
  ReportRange,
  setReportRange,
} from '../store/reportsSlice';

export const useReports = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reportsState = useSelector((state: RootState) => state.reports);

  const loadAllReports = useCallback(
    (range?: ReportRange) => dispatch(fetchAllReports(range || reportsState.range)),
    [dispatch, reportsState.range]
  );
  const loadDashboard = useCallback(() => dispatch(fetchReportDashboard()), [dispatch]);
  const loadRevenue = useCallback(
    (range?: ReportRange) => dispatch(fetchRevenueReport(range || reportsState.range)),
    [dispatch, reportsState.range]
  );
  const loadBookings = useCallback(
    (range?: ReportRange) => dispatch(fetchBookingsReport(range || reportsState.range)),
    [dispatch, reportsState.range]
  );
  const loadUserGrowth = useCallback(
    (range?: ReportRange) => dispatch(fetchUserGrowthReport(range || reportsState.range)),
    [dispatch, reportsState.range]
  );
  const updateRange = useCallback((range: ReportRange) => dispatch(setReportRange(range)), [dispatch]);
  const clearError = useCallback(() => dispatch(clearReportsError()), [dispatch]);

  return {
    ...reportsState,
    loadAllReports,
    loadDashboard,
    loadRevenue,
    loadBookings,
    loadUserGrowth,
    updateRange,
    clearError,
  };
};
