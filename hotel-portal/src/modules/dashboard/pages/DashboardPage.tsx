import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BedDouble, MapPin, Image as ImageIcon, Phone, Mail, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

import api from '../../../api/axios';
import { useAuthStore } from '../../../store/useAuthStore';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const { data: hotel } = useQuery({
    queryKey: ['hotel-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      const response = await api.get(`/hotels/${user.id}`);
      return response.data?.data ?? null;
    },
    enabled: !!user?.id,
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
          <h1 className="text-2xl font-bold text-[var(--tp-text)]">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-[var(--tp-text-muted)]">
            Overview of <span className="font-semibold text-[var(--tp-text)]">{hotel?.name || 'your hotel'}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)] px-4 py-2 text-sm font-medium text-[var(--tp-text-muted)]">
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
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[color:color-mix(in_srgb,var(--tp-panel-subtle)_78%,transparent)] opacity-50 transition-transform duration-500 group-hover:scale-110" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`${stat.color} rounded-xl p-3 shadow-lg shadow-black/10`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-sm font-medium text-[var(--tp-text-muted)]">{stat.label}</p>
              <h3 className="mt-1 text-3xl font-bold text-[var(--tp-text)]">{stat.value}</h3>
              <p className="mt-2 text-[10px] font-medium text-[var(--tp-text-soft)]">{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--tp-text)]">Hotel Profile Snapshot</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--tp-text-muted)]">Hotel</span>
              <span className="font-semibold text-[var(--tp-text)]">{hotel?.name || '-'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1 text-[var(--tp-text-muted)]">
                <MapPin className="w-4 h-4" /> Location
              </span>
              <span className="text-right font-semibold text-[var(--tp-text)]">
                {hotel?.city || '-'}, {hotel?.country || '-'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1 text-[var(--tp-text-muted)]">
                <Mail className="w-4 h-4" /> Email
              </span>
              <span className="font-semibold text-[var(--tp-text)]">{hotel?.email || '-'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1 text-[var(--tp-text-muted)]">
                <Phone className="w-4 h-4" /> Phone
              </span>
              <span className="font-semibold text-[var(--tp-text)]">{hotel?.phone || '-'}</span>
            </div>
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--tp-text)]">Operational Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--tp-text-muted)]">Profile Status</span>
              <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                {user?.status || 'APPROVED'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--tp-text-muted)]">Room Inventory</span>
              <span className="font-semibold text-[var(--tp-text)]">{totalRoomUnits} units</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--tp-text-muted)]">Service Catalog</span>
              <span className="font-semibold text-[var(--tp-text)]">{servicesCount} services</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--tp-text-muted)]">Last Updated</span>
              <span className="font-semibold text-[var(--tp-text)]">
                {hotel?.updatedAt ? new Date(hotel.updatedAt).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--tp-text)]">Room Inventory</h2>
            <p className="mt-1 text-sm text-[var(--tp-text-muted)]">
              Live room types configured for this hotel.
            </p>
          </div>
          <div className="rounded-full bg-[var(--tp-panel-strong)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--tp-text-muted)]">
            {rooms.length} type{rooms.length === 1 ? '' : 's'}
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--tp-border)] px-4 py-8 text-center text-sm text-[var(--tp-text-muted)]">
            No rooms have been added for this hotel yet.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room: any) => (
              <div key={room.id} className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-panel-subtle)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[var(--tp-text)]">{room.type}</h3>
                    <p className="mt-1 text-sm text-[var(--tp-text-muted)]">
                      Capacity {room.capacity} guest{room.capacity === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[var(--tp-panel)] px-3 py-2 text-right shadow-sm shadow-black/10">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--tp-text-soft)]">
                      Price
                    </div>
                    <div className="text-sm font-bold text-[var(--tp-text)]">
                      PKR {Number(room.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--tp-panel)] px-3 py-2 text-sm">
                  <span className="text-[var(--tp-text-muted)]">Total rooms</span>
                  <span className="font-semibold text-[var(--tp-text)]">{room.quantity || 0}</span>
                </div>

                {(room.amenities || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(room.amenities || []).map((amenity: string) => (
                      <span
                        key={`${room.id}-${amenity}`}
                        className="rounded-md bg-[var(--tp-panel)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--tp-text-muted)]"
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
          <h2 className="text-xl font-bold text-[var(--tp-text)]">Description</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--tp-text-muted)]">{hotel.description}</p>
        </section>
      )}

      {hotel?.amenities?.length > 0 && (
        <section className="card p-6">
          <h2 className="text-xl font-bold text-[var(--tp-text)]">Amenities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {hotel.amenities.map((amenity: string) => (
              <span
                key={amenity}
                className="rounded-md bg-[var(--tp-panel-strong)] px-2 py-1 text-xs font-semibold text-[var(--tp-text-muted)]"
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
