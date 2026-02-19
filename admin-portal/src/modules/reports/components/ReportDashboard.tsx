import { useEffect } from 'react';
import { useReports } from '../hooks/useReports';
import ReportCharts from './ReportCharts';
import { ReportRange } from '../store/reportsSlice';

const rangeOptions: Array<{ label: string; value: ReportRange }> = [
  { label: 'Last 3 Months', value: '3months' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'Last 12 Months', value: '12months' },
];

const ReportDashboard = () => {
  const {
    dashboardStats,
    revenueData,
    bookingsData,
    userGrowthData,
    range,
    loading,
    error,
    updateRange,
    loadAllReports,
  } = useReports();

  useEffect(() => {
    loadAllReports(range);
  }, [loadAllReports, range]);

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-1">Failed to load reports</h3>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${Math.round(dashboardStats?.totalRevenue || 0).toLocaleString()}`,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      label: 'Total Bookings',
      value: (dashboardStats?.totalBookings || 0).toLocaleString(),
      color: 'from-emerald-500 to-green-600',
    },
    {
      label: 'Total Users',
      value: (dashboardStats?.totalUsers || 0).toLocaleString(),
      color: 'from-sky-500 to-blue-600',
    },
    {
      label: 'Total Agencies',
      value: (dashboardStats?.totalAgencies || 0).toLocaleString(),
      color: 'from-violet-500 to-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-xs text-gray-400">Platform insights and growth trends</p>
        </div>
        <select
          value={range}
          onChange={(e) => updateRange(e.target.value as ReportRange)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm transition-all cursor-pointer"
        >
          {rangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-r ${card.color} rounded-2xl p-5 text-white shadow-md`}
          >
            <p className="text-xs text-white/75 mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <ReportCharts
        revenueData={revenueData}
        bookingsData={bookingsData}
        userGrowthData={userGrowthData}
      />
    </div>
  );
};

export default ReportDashboard;
