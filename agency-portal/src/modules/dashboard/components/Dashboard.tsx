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
    dispatch(fetchVehicles({ limit: 100 }) as any);
  }, [dispatch]);

  const totalVehicles = vehicles.length;
  const approvedVehicles = vehicles.filter((v: any) => v.status === 'APPROVED').length;
  const pendingVehicles = vehicles.filter((v: any) => v.status === 'PENDING').length;
  const availableVehicles = vehicles.filter((v: any) => v.isAvailable).length;

  const stats = [
    {
      title: 'Total Vehicles',
      value: totalVehicles,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 17h.01M16 17h.01M3 11l1.5-5.25A2 2 0 016.42 4h11.16a2 2 0 011.92 1.75L21 11M3 11v6a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-6M3 11h18" />
        </svg>
      ),
      link: '/transport',
      change: `${totalVehicles} registered`,
    },
    {
      title: 'Approved',
      value: approvedVehicles,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/transport?status=APPROVED',
      change: `${approvedVehicles} active`,
    },
    {
      title: 'Pending Review',
      value: pendingVehicles,
      gradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/transport?status=PENDING',
      change: pendingVehicles > 0 ? 'Action needed' : 'All clear',
    },
    {
      title: 'Available',
      value: availableVehicles,
      gradient: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      link: '/transport',
      change: `${Math.round((availableVehicles / (totalVehicles || 1)) * 100)}% fleet`,
    },
  ];

  const quickActions = [
    {
      title: 'Add Vehicle',
      description: 'Register a new transport vehicle',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
        </svg>
      ),
      link: '/transport/new',
      gradient: 'from-indigo-600 to-purple-600',
    },
    {
      title: 'Add Hotel',
      description: 'Register a new hotel property',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      link: '/hotels/new',
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Manage Fleet',
      description: 'View and manage all your vehicles',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 17h.01M16 17h.01M3 11l1.5-5.25A2 2 0 016.42 4h11.16a2 2 0 011.92 1.75L21 11M3 11v6a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-6M3 11h18" />
        </svg>
      ),
      link: '/transport',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'Manage Hotels',
      description: 'View and manage all your hotels',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      link: '/hotels',
      gradient: 'from-pink-600 to-rose-600',
    },
  ];

  return (
    <div className="space-y-8 animate-pageIn">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.name || 'Agency'}!</h1>
            <p className="text-indigo-100 text-sm">Here's an overview of your business performance</p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
            <svg className="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <div className="text-[10px] text-indigo-200 uppercase tracking-wider">Today</div>
              <div className="text-lg font-bold leading-tight">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => navigate(stat.link)}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-cardIn"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-xs text-gray-400">{stat.change}</p>
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-700`} style={{ width: `${Math.min((stat.value / (totalVehicles || 1)) * 100, 100)}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Get started quickly</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={() => navigate(action.link)}
              className={`bg-gradient-to-br ${action.gradient} text-white rounded-2xl p-5 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group active:scale-[0.98] animate-cardIn`}
              style={{ animationDelay: `${0.3 + index * 0.08}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold mb-0.5">{action.title}</h3>
                  <p className="text-white/70 text-xs">{action.description}</p>
                </div>
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Vehicles */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Vehicles</h2>
            <p className="text-xs text-gray-400 mt-0.5">Your latest vehicle registrations</p>
          </div>
          <button
            onClick={() => navigate('/transport')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-700 font-medium hover:bg-indigo-50 rounded-xl transition-all duration-200 text-sm active:scale-95"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {vehiclesLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-indigo-600 mb-4"></div>
            <p className="text-sm text-gray-400">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17h.01M16 17h.01M3 11l1.5-5.25A2 2 0 016.42 4h11.16a2 2 0 011.92 1.75L21 11M3 11v6a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-6M3 11h18" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No vehicles yet</h3>
            <p className="text-sm text-gray-400 mb-5">Get started by adding your first vehicle to the platform.</p>
            <button
              onClick={() => navigate('/transport/new')}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm active:scale-95"
            >
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.slice(0, 6).map((vehicle: any, index: number) => (
              <div
                key={vehicle.id}
                onClick={() => navigate(`/transport/${vehicle.id}/edit`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-cardIn"
                style={{ animationDelay: `${0.5 + index * 0.06}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{vehicle.year} • {vehicle.type}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${vehicle.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : vehicle.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}
                  >
                    {vehicle.status}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Capacity</span>
                    <span className="font-semibold text-gray-700">{vehicle.capacity} seats</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Price/Day</span>
                    <span className="font-semibold text-gray-700">PKR {vehicle.pricePerDay?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-semibold ${vehicle.isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                      {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center text-indigo-600 text-xs font-medium group-hover:gap-1.5 transition-all">
                    <span>View Details</span>
                    <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pageIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pageIn { animation: pageIn 0.4s ease-out; }
        .animate-cardIn { animation: cardIn 0.5s ease-out both; }
      `}</style>
    </div>
  );
};

export default Dashboard;
