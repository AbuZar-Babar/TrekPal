import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchBookings } from '../../bookings/store/bookingsSlice';
import { fetchVehicles } from '../../transport/store/transportSlice';
import { RootState } from '../../../store';
import { formatCurrency } from '../../../shared/utils/formatters';

const Dashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);
  const { vehicles } = useSelector((state: RootState) => state.transport);
  const { bookings } = useSelector((state: RootState) => state.bookings);

  useEffect(() => {
    dispatch(fetchVehicles({ limit: 100 }) as any);
    dispatch(fetchBookings({ limit: 100 }) as any);
  }, [dispatch]);

  const pendingBookings = bookings.filter((booking) => booking.status === 'PENDING');
  const confirmedBookings = bookings.filter((booking) => booking.status === 'CONFIRMED');
  const completedBookings = bookings.filter((booking) => booking.status === 'COMPLETED');
  const availableVehicles = vehicles.filter((vehicle) => vehicle.isAvailable);
  const confirmedRevenue = bookings
    .filter((booking) => booking.status === 'CONFIRMED' || booking.status === 'COMPLETED')
    .reduce((sum, booking) => sum + booking.totalAmount, 0);
  const stats = [
    {
      label: 'Fleet size',
      value: vehicles.length,
      note: `${availableVehicles.length} currently available`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13h18l-1.5-5.25A2 2 0 0017.58 6H6.42a2 2 0 00-1.92 1.75L3 13zm2 0v4a1 1 0 001 1h1a2 2 0 104 0h6a2 2 0 104 0h1a1 1 0 001-1v-4" />
        </svg>
      ),
    },
    {
      label: 'Pending bookings',
      value: pendingBookings.length,
      note: `${confirmedBookings.length} already confirmed`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 4h10l3 3v13H4V7l3-3zm0 5h10M8 13h8M8 17h5" />
        </svg>
      ),
    },
    {
      label: 'Completed trips',
      value: completedBookings.length,
      note: `${formatCurrency(confirmedRevenue)} secured`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      label: 'Unavailable vehicles',
      value: vehicles.length - availableVehicles.length,
      note: `${bookings.length} total bookings on record`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13h18m-4 4h.01M7 17h.01M5 13l1.5-5.25A2 2 0 018.42 6h7.16a2 2 0 011.92 1.75L19 13m-14 0v4a1 1 0 001 1h1a2 2 0 104 0h2a2 2 0 104 0h1a1 1 0 001-1v-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="section-title-row">
        <h2 className="section-title">
          Welcome back, {user?.name || 'Vehicle partner'}
        </h2>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="surface flex flex-col items-center justify-center p-5 text-center">
            <div className="mb-2 text-[var(--text-soft)]">{stat.icon}</div>
            <div className="text-3xl font-bold text-[var(--text)]">{stat.value}</div>
            <div className="mt-2 text-sm font-medium text-[var(--text-soft)]">{stat.label}</div>
            <div className="mt-1 text-xs text-[var(--text-muted)]">{stat.note}</div>
          </div>
        ))}
      </section>

    </div>
  );
};

export default Dashboard;
