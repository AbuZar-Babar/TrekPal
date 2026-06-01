import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import { useAuthStore } from '../../../store/useAuthStore';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await api.get(`/hotels/${user.id}`);
      return response.data?.data ?? null;
    },
    enabled: !!user?.id,
  });

  const totalRoomUnits = (hotel?.rooms || []).reduce(
    (sum: number, room: any) => sum + (room.quantity || 0), 0
  );
  const servicesCount = hotel?.services?.length || 0;
  const imageCount = hotel?.images?.length || 0;
  const rooms: any[] = hotel?.rooms || [];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="border-b border-[var(--tp-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--tp-text)]">
          {isLoading ? 'Dashboard' : `${hotel?.name || 'Hotel'}`}
        </h1>
        <p className="mt-0.5 text-sm text-[var(--tp-text-soft)]">
          Overview of your hotel inventory and profile
        </p>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Room units', value: totalRoomUnits },
          { label: 'Room types', value: rooms.length, highlight: true },
          { label: 'Services', value: servicesCount },
          { label: 'Gallery', value: `${imageCount} photos` },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[var(--tp-border)] bg-[var(--tp-panel)] px-4 py-3">
            <div className="text-[10px] uppercase tracking-wide text-[var(--tp-text-soft)]">{s.label}</div>
            <div className={`mt-1 text-lg font-semibold tabular-nums ${s.highlight ? 'text-[var(--tp-primary)]' : 'text-[var(--tp-text)]'}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Profile + status */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)]">
          <div className="border-b border-[var(--tp-border)] px-5 py-3">
            <h2 className="text-sm font-semibold text-[var(--tp-text)]">Hotel profile</h2>
          </div>
          <div className="divide-y divide-[var(--tp-border)]">
            {[
              { label: 'Name', value: hotel?.name || '—' },
              { label: 'City', value: hotel?.city ? `${hotel.city}, ${hotel.country || ''}` : '—' },
              { label: 'Email', value: hotel?.email || '—' },
              { label: 'Phone', value: hotel?.phone || '—' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-[var(--tp-text-soft)]">{row.label}</span>
                <span className="font-medium text-[var(--tp-text)] text-right max-w-[60%] truncate">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)]">
          <div className="border-b border-[var(--tp-border)] px-5 py-3">
            <h2 className="text-sm font-semibold text-[var(--tp-text)]">Operational summary</h2>
          </div>
          <div className="divide-y divide-[var(--tp-border)]">
            {[
              {
                label: 'Status',
                value: (
                  <span className="inline-flex rounded-full bg-[var(--tp-success-bg)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--tp-success-text)]">
                    {user?.status || 'Approved'}
                  </span>
                ),
              },
              { label: 'Room inventory', value: `${totalRoomUnits} units` },
              { label: 'Service catalog', value: `${servicesCount} services` },
              {
                label: 'Last updated',
                value: hotel?.updatedAt
                  ? new Date(hotel.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—',
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-[var(--tp-text-soft)]">{row.label}</span>
                {typeof row.value === 'string'
                  ? <span className="font-medium text-[var(--tp-text)]">{row.value}</span>
                  : row.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Room inventory */}
      <div className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)]">
        <div className="flex items-center justify-between border-b border-[var(--tp-border)] px-5 py-3">
          <h2 className="text-sm font-semibold text-[var(--tp-text)]">Room inventory</h2>
          <span className="rounded-full border border-[var(--tp-border)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--tp-text-soft)]">
            {rooms.length} type{rooms.length !== 1 ? 's' : ''}
          </span>
        </div>
        {rooms.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-[var(--tp-text-soft)]">
            No rooms added yet
          </div>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room: any) => (
              <div key={room.id} className="rounded-lg border border-[var(--tp-border)] bg-[var(--tp-panel-subtle)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-[var(--tp-text)]">{room.type}</div>
                    <div className="text-xs text-[var(--tp-text-soft)] mt-0.5">{room.capacity} guests · {room.quantity} rooms</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-[var(--tp-text-soft)]">per night</div>
                    <div className="text-sm font-semibold text-[var(--tp-text)]">PKR {Number(room.price || 0).toLocaleString()}</div>
                  </div>
                </div>
                {(room.amenities || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {room.amenities.slice(0, 4).map((a: string) => (
                      <span key={a} className="rounded-full border border-[var(--tp-border)] px-2 py-0.5 text-[10px] text-[var(--tp-text-muted)]">
                        {a}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="rounded-full border border-[var(--tp-border)] px-2 py-0.5 text-[10px] text-[var(--tp-text-muted)]">
                        +{room.amenities.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      {hotel?.description && (
        <div className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--tp-text)] mb-2">Description</h2>
          <p className="text-sm leading-relaxed text-[var(--tp-text-muted)]">{hotel.description}</p>
        </div>
      )}

      {/* Amenities */}
      {(hotel?.amenities || []).length > 0 && (
        <div className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--tp-text)] mb-3">Hotel amenities</h2>
          <div className="flex flex-wrap gap-1.5">
            {hotel.amenities.map((a: string) => (
              <span key={a} className="rounded-full border border-[var(--tp-border)] bg-[var(--tp-panel-subtle)] px-2.5 py-0.5 text-xs text-[var(--tp-text-muted)]">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
