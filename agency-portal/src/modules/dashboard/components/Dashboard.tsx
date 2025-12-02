import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../store';
import { fetchVehicles } from '../../transport/store/transportSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { vehicles, loading: vehiclesLoading } = useSelector(
    (state: RootState) => state.transport
  );

  useEffect(() => {
    // Fetch vehicles for stats
    dispatch(fetchVehicles({ limit: 100 }) as any);
  }, [dispatch]);

  // Calculate stats
  const totalVehicles = vehicles.length;
  const approvedVehicles = vehicles.filter((v) => v.status === 'APPROVED').length;
  const pendingVehicles = vehicles.filter((v) => v.status === 'PENDING').length;
  const rejectedVehicles = vehicles.filter((v) => v.status === 'REJECTED').length;
  const availableVehicles = vehicles.filter((v) => v.isAvailable).length;

  const stats = [
    {
      title: 'Total Vehicles',
      value: totalVehicles,
      gradient: 'from-blue-500 to-blue-600',
      icon: '🚗',
      link: '/transport',
      change: '+12%',
    },
    {
      title: 'Approved',
      value: approvedVehicles,
      gradient: 'from-emerald-500 to-emerald-600',
      icon: '✅',
      link: '/transport?status=APPROVED',
      change: '+5%',
    },
    {
      title: 'Pending',
      value: pendingVehicles,
      gradient: 'from-amber-500 to-amber-600',
      icon: '⏳',
      link: '/transport?status=PENDING',
      change: pendingVehicles > 0 ? 'Action needed' : 'All clear',
    },
    {
      title: 'Available',
      value: availableVehicles,
      gradient: 'from-indigo-500 to-indigo-600',
      icon: '✓',
      link: '/transport',
      change: `${Math.round((availableVehicles / totalVehicles) * 100) || 0}%`,
    },
  ];

  const quickActions = [
    {
      title: 'Add New Vehicle',
      description: 'Register a new transport vehicle',
      icon: '➕',
      link: '/transport/new',
      gradient: 'from-indigo-600 to-purple-600',
    },
    {
      title: 'Add New Hotel',
      description: 'Register a new hotel property',
      icon: '🏨',
      link: '/hotels/new',
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Manage Vehicles',
      description: 'View and manage all your vehicles',
      icon: '🚗',
      link: '/transport',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'Manage Hotels',
      description: 'View and manage all your hotels',
      icon: '🏨',
      link: '/hotels',
      gradient: 'from-pink-600 to-rose-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'Agency'}!</h1>
            <p className="text-indigo-100 text-lg">
              Here's an overview of your business performance
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm text-indigo-100">Today</div>
              <div className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => navigate(stat.link)}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-2">{stat.change}</p>
              </div>
              <div className={`bg-gradient-to-br ${stat.gradient} w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-500`} style={{ width: `${Math.min((stat.value / (totalVehicles || 1)) * 100, 100)}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <span className="text-sm text-gray-500">Get started quickly</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={() => navigate(action.link)}
              className={`bg-gradient-to-br ${action.gradient} text-white rounded-xl p-6 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">{action.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{action.title}</h3>
                  <p className="text-white/90 text-sm">{action.description}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Vehicles */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Vehicles</h2>
            <p className="text-sm text-gray-500 mt-1">Your latest vehicle registrations</p>
          </div>
          <button
            onClick={() => navigate('/transport')}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
          >
            View All
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {vehiclesLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-500">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first vehicle to the platform.</p>
            <button
              onClick={() => navigate('/transport/new')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
            >
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.slice(0, 6).map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => navigate(`/transport/${vehicle.id}/edit`)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.type}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      vehicle.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : vehicle.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Seats</span>
                    <span className="font-semibold text-gray-900">{vehicle.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price/Day</span>
                    <span className="font-semibold text-gray-900">PKR {vehicle.pricePerDay.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Availability</span>
                    <span className={`font-semibold ${vehicle.isAvailable ? 'text-emerald-600' : 'text-red-600'}`}>
                      {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:gap-2 transition-all">
                    <span>View Details</span>
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
