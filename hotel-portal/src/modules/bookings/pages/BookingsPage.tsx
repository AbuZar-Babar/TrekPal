import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import { useAuthStore } from '../../../store/useAuthStore';

type HotelBooking = {
  id: string;
  source: 'DIRECT_BOOKING' | 'PACKAGE_RESERVATION';
  bookingId: string | null;
  packageId: string | null;
  packageName: string | null;
  agencyId: string | null;
  agencyName: string | null;
  travelerName: string | null;
  roomId: string;
  roomType: string;
  reservedRooms: number;
  status: string;
  totalAmount: number | null;
  startDate: string;
  endDate: string;
  stayLengthDays: number;
  createdAt: string;
  updatedAt: string;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatStatus = (value: string) =>
  value.toLowerCase().split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

const statusClass = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'RESERVED':
      return 'bg-[var(--tp-success-bg)] text-[var(--tp-success-text)]';
    case 'PENDING':
    case 'HELD':
      return 'bg-[var(--tp-warning-bg)] text-[var(--tp-warning-text)]';
    case 'CANCELLED':
      return 'bg-[var(--tp-danger-bg)] text-[var(--tp-danger-text)]';
    default:
      return 'bg-[var(--tp-panel-strong)] text-[var(--tp-text-muted)]';
  }
};

const BookingsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['hotel-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings', { params: { page: 1, limit: 100 } });
      return response.data?.data as { bookings: HotelBooking[]; total: number };
    },
    enabled: !!user,
  });

  const bookings = data?.bookings || [];
  const directCount = bookings.filter((b) => b.source === 'DIRECT_BOOKING').length;
  const packageCount = bookings.filter((b) => b.source === 'PACKAGE_RESERVATION').length;
  const totalReservedRooms = bookings.reduce((sum, b) => sum + b.reservedRooms, 0);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--tp-border)] border-t-[var(--tp-primary)]" />
      </div>
    );
  }

  if (isError) {
    const message = (error as any)?.response?.data?.message || 'Failed to load bookings.';
    return (
      <div className="rounded-xl border border-[var(--tp-danger-bg)] bg-[var(--tp-danger-bg)] px-4 py-3 text-sm text-[var(--tp-danger-text)]">
        {message}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="border-b border-[var(--tp-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--tp-text)]">Bookings</h1>
        <p className="mt-0.5 text-sm text-[var(--tp-text-soft)]">
          Agency reservations and direct bookings for your hotel
        </p>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total records', value: bookings.length },
          { label: 'Via packages', value: packageCount, highlight: true },
          { label: 'Direct', value: directCount },
          { label: 'Rooms reserved', value: totalReservedRooms },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[var(--tp-border)] bg-[var(--tp-panel)] px-4 py-3">
            <div className="text-[10px] uppercase tracking-wide text-[var(--tp-text-soft)]">{s.label}</div>
            <div className={`mt-1 text-lg font-semibold tabular-nums ${s.highlight ? 'text-[var(--tp-primary)]' : 'text-[var(--tp-text)]'}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Booking list */}
      <div className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)] overflow-hidden">
        <div className="border-b border-[var(--tp-border)] px-5 py-3">
          <h2 className="text-sm font-semibold text-[var(--tp-text)]">Booking activity</h2>
        </div>

        {bookings.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-[var(--tp-text-soft)]">
            No booking activity yet
          </div>
        ) : (
          <div className="divide-y divide-[var(--tp-border)]">
            {bookings.map((booking) => (
              <div key={booking.id} className="px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[var(--tp-border)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--tp-text-muted)]">
                        {booking.source === 'PACKAGE_RESERVATION' ? 'Package' : 'Direct'}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClass(booking.status)}`}>
                        {formatStatus(booking.status)}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <div className="font-semibold text-[var(--tp-text)]">{booking.roomType}</div>
                      <div className="text-xs text-[var(--tp-text-soft)] mt-0.5">
                        {booking.reservedRooms} room{booking.reservedRooms > 1 ? 's' : ''} reserved
                      </div>
                    </div>

                    {/* Meta grid */}
                    <div className="grid gap-1.5 text-xs text-[var(--tp-text-muted)] sm:grid-cols-2">
                      <div className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5 shrink-0 text-[var(--tp-text-soft)]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2 2 2h4a2 2 0 012 2v12a2 2 0 01-2 2z" />
                        </svg>
                        Agency: <span className="font-medium text-[var(--tp-text)] ml-1">{booking.agencyName || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5 shrink-0 text-[var(--tp-text-soft)]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5 shrink-0 text-[var(--tp-text-soft)]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                        </svg>
                        {booking.packageName ? `Offer: ${booking.packageName}` : 'Direct booking'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5 shrink-0 text-[var(--tp-text-soft)]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {booking.travelerName || 'No traveler assigned'}
                      </div>
                    </div>
                  </div>

                  {/* Stay length */}
                  <div className="shrink-0 rounded-lg border border-[var(--tp-border)] bg-[var(--tp-panel-subtle)] px-4 py-3 text-center min-w-[100px]">
                    <div className="text-[10px] uppercase tracking-wide text-[var(--tp-text-soft)]">Stay</div>
                    <div className="mt-1 text-2xl font-semibold text-[var(--tp-text)]">{booking.stayLengthDays}</div>
                    <div className="text-xs text-[var(--tp-text-soft)]">day{booking.stayLengthDays > 1 ? 's' : ''}</div>
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

export default BookingsPage;
