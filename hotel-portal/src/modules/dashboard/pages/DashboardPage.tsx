import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BedDouble, MapPin, Image as ImageIcon, Phone, Mail, Star, Clock } from 'lucide-react';
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

  const servicesCount = hotel?.services?.length || 0;
  const imageCount = hotel?.images?.length || 0;
  const rooms = hotel?.rooms || [];

  const stats = [
    {
      label: 'Room Units',
      value: totalRoomUnits,
      icon: BedDouble,
      color: 'bg-blue-500',
      trend: `${hotel?.rooms?.length || 0} room types`,
    },
    {
      label: 'Services',
      value: servicesCount,
      icon: Star,
      color: 'bg-amber-500',
      trend: 'Configured services',
    },
    {
      label: 'Gallery Images',
      value: imageCount,
      icon: ImageIcon,
      color: 'bg-purple-500',
      trend: 'Visible to agencies',
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-slate-500">
            Overview of <span className="font-semibold text-slate-700">{hotel?.name || 'your hotel'}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>

            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Hotel Profile Snapshot</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Hotel</span>
              <span className="font-semibold text-slate-900">{hotel?.name || '-'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Location
              </span>
              <span className="font-semibold text-slate-900 text-right">
                {hotel?.city || '-'}, {hotel?.country || '-'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 flex items-center gap-1">
                <Mail className="w-4 h-4" /> Email
              </span>
              <span className="font-semibold text-slate-900">{hotel?.email || '-'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 flex items-center gap-1">
                <Phone className="w-4 h-4" /> Phone
              </span>
              <span className="font-semibold text-slate-900">{hotel?.phone || '-'}</span>
            </div>
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Operational Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Profile Status</span>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 uppercase tracking-wider">
                {user?.status || 'APPROVED'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Room Inventory</span>
              <span className="font-semibold text-slate-900">{totalRoomUnits} units</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Service Catalog</span>
              <span className="font-semibold text-slate-900">{servicesCount} services</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Last Updated</span>
              <span className="font-semibold text-slate-900">
                {hotel?.updatedAt ? new Date(hotel.updatedAt).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Room Inventory</h2>
            <p className="mt-1 text-sm text-slate-500">
              Live room types configured for this hotel.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
            {rooms.length} type{rooms.length === 1 ? '' : 's'}
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            No rooms have been added for this hotel yet.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room: any) => (
              <div key={room.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{room.type}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Capacity {room.capacity} guest{room.capacity === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Price
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      PKR {Number(room.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                  <span className="text-slate-500">Total rooms</span>
                  <span className="font-semibold text-slate-900">{room.quantity || 0}</span>
                </div>

                {(room.amenities || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(room.amenities || []).map((amenity: string) => (
                      <span
                        key={`${room.id}-${amenity}`}
                        className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {hotel?.description && (
        <section className="card p-6">
          <h2 className="text-xl font-bold text-slate-900">Description</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{hotel.description}</p>
        </section>
      )}

      {hotel?.amenities?.length > 0 && (
        <section className="card p-6">
          <h2 className="text-xl font-bold text-slate-900">Amenities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {hotel.amenities.map((amenity: string) => (
              <span
                key={amenity}
                className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
              >
                {amenity}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
