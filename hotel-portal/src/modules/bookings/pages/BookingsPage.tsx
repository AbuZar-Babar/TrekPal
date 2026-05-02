import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, CalendarDays, Loader2, Package2, UserRound } from 'lucide-react';

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

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatStatus = (value: string): string =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getStatusTone = (status: string): string => {
  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'RESERVED':
      return 'bg-emerald-50 text-emerald-700';
    case 'PENDING':
    case 'HELD':
      return 'bg-amber-50 text-amber-700';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const BookingsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['hotel-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings', {
        params: { page: 1, limit: 100 },
      });

      return response.data?.data as {
        bookings: HotelBooking[];
        total: number;
        page: number;
        limit: number;
      };
    },
    enabled: !!user,
  });

  const bookings = data?.bookings || [];
  const directCount = bookings.filter((booking) => booking.source === 'DIRECT_BOOKING').length;
  const packageCount = bookings.filter((booking) => booking.source === 'PACKAGE_RESERVATION').length;
  const totalReservedRooms = bookings.reduce((sum, booking) => sum + booking.reservedRooms, 0);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (isError) {
    const message = (error as any)?.response?.data?.message || 'Failed to load booking activity for this hotel.';
    return (
      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-900">Bookings</h1>
        <p className="mt-3 text-sm text-rose-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500">
            See which agency reserved which room and for how many days.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <p className="text-sm font-medium text-slate-500">Total Records</p>
          <div className="mt-2 text-3xl font-bold text-slate-900">{bookings.length}</div>
          <p className="mt-2 text-xs text-slate-400">Direct bookings and package reservations</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-slate-500">Package Reservations</p>
          <div className="mt-2 text-3xl font-bold text-slate-900">{packageCount}</div>
          <p className="mt-2 text-xs text-slate-400">Offer-based agency room holds</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-slate-500">Room Units Reserved</p>
          <div className="mt-2 text-3xl font-bold text-slate-900">{totalReservedRooms}</div>
          <p className="mt-2 text-xs text-slate-400">{directCount} direct traveler booking(s)</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Booking Activity</h2>
        </div>

        {bookings.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No booking activity found for this hotel yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <div key={booking.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        {booking.source === 'PACKAGE_RESERVATION' ? 'Package reservation' : 'Direct booking'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusTone(booking.status)}`}>
                        {formatStatus(booking.status)}
                      </span>
                    </div>

                    <div>
                      <div className="text-lg font-bold text-slate-900">{booking.roomType}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {booking.reservedRooms} room unit{booking.reservedRooms > 1 ? 's' : ''} reserved
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>
                          Agency: <span className="font-semibold text-slate-900">{booking.agencyName || 'Unknown agency'}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        <span>
                          {formatDate(booking.startDate)} to {formatDate(booking.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package2 className="w-4 h-4 text-slate-400" />
                        <span>
                          {booking.packageName
                            ? `Offer: ${booking.packageName}`
                            : 'Custom/direct traveler booking'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserRound className="w-4 h-4 text-slate-400" />
                        <span>
                          {booking.travelerName ? `Traveler: ${booking.travelerName}` : 'Traveler not assigned yet'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[180px] rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Stay length
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">
                      {booking.stayLengthDays}
                    </div>
                    <div className="text-sm text-slate-500">
                      day{booking.stayLengthDays > 1 ? 's' : ''}
                    </div>
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
