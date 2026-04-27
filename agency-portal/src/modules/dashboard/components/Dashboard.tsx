import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
    { label: 'Traveler requests', value: tripRequests.length, note: `${urgentNegotiations.length} need a reply` },
    { label: 'Published offers', value: activeOffers.length, note: `${packages.length - activeOffers.length} still hidden` },
    { label: 'Live bookings', value: liveBookings.length, note: `${formatCurrency(confirmedRevenue)} secured` },
    { label: 'Ready inventory', value: hotels.length + availableVehicles.length, note: `${availableVehicles.length} vehicles available` },
  ];

  const actions = [
    { label: 'Create trip', path: '/packages/new' },
    { label: 'View requests', path: '/trip-requests' },
    { label: 'Add hotel', path: '/hotels/new' },
    { label: 'Add vehicle', path: '/transport/new' },
  ];

  return (
    <div className="space-y-6">
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-[var(--text)]">
          Welcome back, {user?.name || 'Agency'}
        </h2>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="surface flex flex-col items-center justify-center p-6 text-center">
            <div className="text-3xl font-bold text-[var(--text)]">{stat.value}</div>
            <div className="mt-2 text-sm font-medium text-[var(--text-soft)]">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="surface p-6">
        <h3 className="mb-6 text-lg font-semibold text-[var(--text)]">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => navigate(action.path)}
              className="app-btn-secondary h-12 text-sm font-medium"
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
