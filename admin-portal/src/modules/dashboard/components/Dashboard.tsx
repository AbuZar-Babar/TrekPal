import { useDashboardStats, useRevenueChart, useBookingsChart, useUserGrowth } from '../hooks/useDashboard';

/**
 * Admin Dashboard with Analytics — Premium Design
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

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl"
        style={{ animation: 'fadeDown 0.5s ease-out' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-24 w-40 h-40 bg-white/5 rounded-full translate-y-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <p className="text-indigo-100 text-sm ml-[52px]">Welcome back! Here's what's happening with your platform.</p>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Bookings */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white"
          style={{ animation: 'cardIn 0.5s ease-out 0.1s both' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full">+8.3%</span>
          </div>
          <h3 className="text-sm font-medium text-green-100 mb-1">Total Bookings</h3>
          <p className="text-3xl font-bold">{stats ? formatNumber(stats.totalBookings) : '0'}</p>
          <p className="text-xs text-green-100 mt-2">All time</p>
        </div>

        {/* Users */}
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg p-6 text-white"
          style={{ animation: 'cardIn 0.5s ease-out 0.2s both' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full">+5.1%</span>
          </div>
          <h3 className="text-sm font-medium text-purple-100 mb-1">Total Users</h3>
          <p className="text-3xl font-bold">{stats ? formatNumber(stats.totalUsers) : '0'}</p>
          <p className="text-xs text-purple-100 mt-2">+{stats?.recentRegistrations.users || 0} this month</p>
        </div>

        {/* Agencies */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white"
          style={{ animation: 'cardIn 0.5s ease-out 0.3s both' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full">+6.2%</span>
          </div>
          <h3 className="text-sm font-medium text-blue-100 mb-1">Total Agencies</h3>
          <p className="text-3xl font-bold">{stats ? formatNumber(stats.totalAgencies) : '0'}</p>
          <p className="text-xs text-blue-100 mt-2">+{stats?.recentRegistrations.agencies || 0} this month</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Hotels */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          style={{ animation: 'cardIn 0.5s ease-out 0.35s both' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Hotels</h3>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4m-4 0v-5a2 2 0 00-2-2h0a2 2 0 00-2 2v5" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats?.totalHotels || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Approved</span>
              <span className="text-base font-semibold text-green-600">{stats?.approvedHotels || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Pending</span>
              <span className="text-base font-semibold text-yellow-600">{stats?.pendingHotels || 0}</span>
            </div>
          </div>
        </div>

        {/* Vehicles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          style={{ animation: 'cardIn 0.5s ease-out 0.4s both' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vehicles</h3>
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 17h.01M16 17h.01M3 11l1.5-5.25A2 2 0 016.42 4h11.16a2 2 0 011.92 1.75L21 11M3 11v6a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-6M3 11h18" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats?.totalVehicles || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Approved</span>
              <span className="text-base font-semibold text-green-600">{stats?.approvedVehicles || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Pending</span>
              <span className="text-base font-semibold text-yellow-600">{stats?.pendingVehicles || 0}</span>
            </div>
          </div>
        </div>

        {/* Agencies */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          style={{ animation: 'cardIn 0.5s ease-out 0.45s both' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Agencies</h3>
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats?.totalAgencies || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Approved</span>
              <span className="text-base font-semibold text-green-600">{stats?.approvedAgencies || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Pending</span>
              <span className="text-base font-semibold text-yellow-600">{stats?.pendingAgencies || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          style={{ animation: 'cardIn 0.5s ease-out 0.5s both' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Revenue Trend</h3>
          </div>
          <div className="h-52 flex items-end justify-between gap-2">
            {revenueData?.map((item, index) => {
              const maxRevenue = Math.max(...(revenueData?.map(d => d.revenue) || [0]));
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-gray-100 rounded-lg relative" style={{ height: '180px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-lg transition-all duration-700 absolute bottom-0 group-hover:from-indigo-600 group-hover:to-indigo-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-2 font-medium">{item.month}</span>
                  <span className="text-[10px] text-gray-400">${(item.revenue / 1000).toFixed(0)}k</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          style={{ animation: 'cardIn 0.5s ease-out 0.55s both' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Bookings Trend</h3>
          </div>
          <div className="h-52 flex items-end justify-between gap-2">
            {bookingsData?.map((item, index) => {
              const maxBookings = Math.max(...(bookingsData?.map(d => d.bookings) || [0]));
              const height = maxBookings > 0 ? (item.bookings / maxBookings) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-gray-100 rounded-lg relative" style={{ height: '180px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-lg transition-all duration-700 absolute bottom-0 group-hover:from-green-600 group-hover:to-emerald-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-2 font-medium">{item.month}</span>
                  <span className="text-[10px] text-gray-400">{item.bookings}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Growth */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        style={{ animation: 'cardIn 0.5s ease-out 0.6s both' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">User Growth</h3>
        </div>
        <div className="h-52 flex items-end justify-between gap-2">
          {userGrowthData?.map((item, index) => {
            const maxUsers = Math.max(...(userGrowthData?.map(d => d.users) || [0]));
            const minUsers = Math.min(...(userGrowthData?.map(d => d.users) || [0]));
            const range = maxUsers - minUsers;
            const height = range > 0 ? ((item.users - minUsers) / range) * 100 : 50;
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-gray-100 rounded-lg relative" style={{ height: '180px' }}>
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-violet-400 rounded-lg transition-all duration-700 absolute bottom-0 group-hover:from-purple-600 group-hover:to-violet-500"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-2 font-medium">{item.month}</span>
                <span className="text-[10px] text-gray-400">{item.users}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
