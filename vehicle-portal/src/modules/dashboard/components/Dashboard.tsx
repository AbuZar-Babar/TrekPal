import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAgencyBids } from '../../bids/store/bidsSlice';
import { fetchBookings } from '../../bookings/store/bookingsSlice';
import { fetchHotels } from '../../hotels/store/hotelsSlice';
import { fetchPackages } from '../../packages/store/packagesSlice';
import { fetchTripRequests } from '../../tripRequests/store/tripRequestsSlice';
import { fetchVehicles } from '../../transport/store/transportSlice';
import { RootState } from '../../../store';
import { formatCurrency } from '../../../shared/utils/formatters';

const Dashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);
  const { vehicles } = useSelector((state: RootState) => state.transport);
  const { hotels } = useSelector((state: RootState) => state.hotels);
  const { packages } = useSelector((state: RootState) => state.packages);
  const { bids } = useSelector((state: RootState) => state.bids);
  const { bookings } = useSelector((state: RootState) => state.bookings);
  const { tripRequests } = useSelector((state: RootState) => state.tripRequests);

  useEffect(() => {
    dispatch(fetchVehicles({ limit: 100 }) as any);
    dispatch(fetchHotels({ limit: 100 }) as any);
    dispatch(fetchPackages({ limit: 100 }) as any);
    dispatch(fetchAgencyBids({ limit: 100 }) as any);
    dispatch(fetchBookings({ limit: 100 }) as any);
    dispatch(fetchTripRequests({ limit: 100 }) as any);
  }, [dispatch]);

  const activeOffers = packages.filter((item) => item.isActive);
  const liveBookings = bookings.filter((item) => item.status !== 'CANCELLED');
  const urgentNegotiations = bids.filter((bid) => bid.awaitingActionBy === 'AGENCY' && bid.status === 'PENDING');
  const availableVehicles = vehicles.filter((vehicle) => vehicle.isAvailable);
  const confirmedRevenue = bookings
    .filter((booking) => booking.status === 'CONFIRMED' || booking.status === 'COMPLETED')
    .reduce((sum, booking) => sum + booking.totalAmount, 0);
  const stats = [
    {
      label: 'Traveler requests',
      value: tripRequests.length,
      note: `${urgentNegotiations.length} need a reply`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      ),
    },
    {
      label: 'Published offers',
      value: activeOffers.length,
      note: `${packages.length - activeOffers.length} still hidden`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7l8-4 8 4-8 4-8-4zm0 5l8 4 8-4m-16 5l8 4 8-4" />
        </svg>
      ),
    },
    {
      label: 'Live bookings',
      value: liveBookings.length,
      note: `${formatCurrency(confirmedRevenue)} secured`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 4h10l3 3v13H4V7l3-3zm0 5h10M8 13h3m2 0h3" />
        </svg>
      ),
    },
    {
      label: 'Ready inventory',
      value: hotels.length + availableVehicles.length,
      note: `${availableVehicles.length} vehicles available`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21h18M5 21V5h14v16M7 13l2-4h6l2 4M8 18a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="section-title-row">
        <h2 className="section-title">
          Welcome back, {user?.name || 'Agency'}
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
