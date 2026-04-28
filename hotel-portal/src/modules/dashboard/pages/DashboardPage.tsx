import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BedDouble, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  Star,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../api/axios';
import { useAuthStore } from '../../../store/useAuthStore';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const { data: hotel } = useQuery({
    queryKey: ['hotel-dashboard'],
    queryFn: async () => {
      const listResponse = await api.get('/hotels', {
        params: { page: 1, limit: 1 },
      });
      return listResponse.data?.data?.hotels?.[0] ?? null;
    },
    enabled: !!user,
  });

  const totalRoomUnits = (hotel?.rooms || []).reduce(
    (sum: number, room: { quantity?: number }) => sum + (room.quantity || 0),
    0
  );

  const stats = [
    { label: 'Total Rooms', value: totalRoomUnits, icon: BedDouble, color: 'bg-blue-500', trend: `${hotel?.rooms?.length || 0} room types` },
    { label: 'Active Bookings', value: 12, icon: Calendar, color: 'bg-green-500', trend: '4 today' },
    { label: 'Monthly Revenue', value: '$4,250', icon: TrendingUp, color: 'bg-purple-500', trend: '+15% from last month' },
    { label: 'Avg Rating', value: '4.8', icon: Star, color: 'bg-amber-500', trend: 'Based on 48 reviews' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-slate-500">Here's what's happening at <span className="font-semibold text-slate-700">{hotel?.name}</span> today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-6 relative group overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-110 transition-transform duration-500 opacity-50" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`${stat.color} p-3 rounded-xl shadow-lg shadow-slate-200`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend.split(' ')[0]}
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Bookings</h2>
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">View all</button>
          </div>
          <div className="card divide-y divide-slate-100">
            {[1, 2, 3, 4].map((booking) => (
              <div key={booking} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">John Doe</p>
                    <p className="text-xs text-slate-500">Deluxe Suite • 2 Nights</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">$240.00</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">
                    Confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts / To-Do */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-primary-50 border border-primary-100 rounded-2xl group hover:bg-primary-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-primary-900">Add Room</p>
                  <p className="text-[10px] text-primary-700">Increase your inventory</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="card p-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Update your price for the <span className="font-bold">Murree Festival</span> weekend (June 15-17).
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You have <span className="font-bold">3 pending services</span> to review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default DashboardPage;
