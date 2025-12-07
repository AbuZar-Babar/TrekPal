import { useDashboardStats, useRevenueChart, useBookingsChart, useUserGrowth } from '../hooks/useDashboard';

/**
 * Admin Dashboard with Analytics
 */
const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData } = useRevenueChart();
  const { data: bookingsData } = useBookingsChart();
  const { data: userGrowthData } = useUserGrowth();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Calculate percentage changes (dummy calculations)
  const revenueChange = 12.5;
  const bookingsChange = 8.3;
  const usersChange = 5.1;
  const agenciesChange = 6.2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              +{revenueChange}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-indigo-100 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold">{stats ? formatCurrency(stats.totalRevenue) : '$0'}</p>
          <p className="text-xs text-indigo-100 mt-2">Last 30 days</p>
        </div>

        {/* Total Bookings */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              +{bookingsChange}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-green-100 mb-1">Total Bookings</h3>
          <p className="text-3xl font-bold">{stats ? formatNumber(stats.totalBookings) : '0'}</p>
          <p className="text-xs text-green-100 mt-2">All time</p>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              +{usersChange}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-purple-100 mb-1">Total Users</h3>
          <p className="text-3xl font-bold">{stats ? formatNumber(stats.totalUsers) : '0'}</p>
          <p className="text-xs text-purple-100 mt-2">+{stats?.recentRegistrations.users || 0} this month</p>
        </div>

        {/* Total Agencies */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              +{agenciesChange}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-blue-100 mb-1">Total Agencies</h3>
          <p className="text-3xl font-bold">{stats ? formatNumber(stats.totalAgencies) : '0'}</p>
          <p className="text-xs text-blue-100 mt-2">+{stats?.recentRegistrations.agencies || 0} this month</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hotels Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Hotels</h3>
            <span className="text-2xl">🏨</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats?.totalHotels || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved</span>
              <span className="text-lg font-semibold text-green-600">{stats?.approvedHotels || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="text-lg font-semibold text-yellow-600">{stats?.pendingHotels || 0}</span>
            </div>
          </div>
        </div>

        {/* Vehicles Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vehicles</h3>
            <span className="text-2xl">🚗</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats?.totalVehicles || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved</span>
              <span className="text-lg font-semibold text-green-600">{stats?.approvedVehicles || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="text-lg font-semibold text-yellow-600">{stats?.pendingVehicles || 0}</span>
            </div>
          </div>
        </div>

        {/* Agencies Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Agencies</h3>
            <span className="text-2xl">🏢</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats?.totalAgencies || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved</span>
              <span className="text-lg font-semibold text-green-600">{stats?.approvedAgencies || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="text-lg font-semibold text-yellow-600">{stats?.pendingAgencies || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {revenueData?.map((item, index) => {
              const maxRevenue = Math.max(...(revenueData?.map(d => d.revenue) || [0]));
              const height = (item.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '200px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 mt-2 font-medium">{item.month}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    ${(item.revenue / 1000).toFixed(0)}k
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {bookingsData?.map((item, index) => {
              const maxBookings = Math.max(...(bookingsData?.map(d => d.bookings) || [0]));
              const height = (item.bookings / maxBookings) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '200px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 mt-2 font-medium">{item.month}</span>
                  <span className="text-xs text-gray-500 mt-1">{item.bookings}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {userGrowthData?.map((item, index) => {
            const maxUsers = Math.max(...(userGrowthData?.map(d => d.users) || [0]));
            const minUsers = Math.min(...(userGrowthData?.map(d => d.users) || [0]));
            const range = maxUsers - minUsers;
            const height = range > 0 ? ((item.users - minUsers) / range) * 100 : 50;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '200px' }}>
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2 font-medium">{item.month}</span>
                <span className="text-xs text-gray-500 mt-1">{item.users}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

