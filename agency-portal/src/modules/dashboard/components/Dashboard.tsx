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
import { formatCurrency, formatDate, formatDateRange } from '../../../shared/utils/formatters';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  const { vehicles, loading: vehiclesLoading } = useSelector((state: RootState) => state.transport);
  const { hotels, loading: hotelsLoading } = useSelector((state: RootState) => state.hotels);
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

  const recentBids = [...bids]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 3);

  const recentBookings = [...bookings]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-[var(--text)]">
          Welcome back, {user?.name || 'Agency'}
        </h2>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface p-5">
          <h3 className="mb-4 text-lg font-semibold text-[var(--text)]">Quick actions</h3>
          <div className="grid grid-cols-2 gap-3">
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
        </div>

        <div className="surface p-5">
          <h3 className="mb-4 text-lg font-semibold text-[var(--text)]">Overview</h3>
          <div className="grid grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] p-3 text-center">
                <div className="text-xl font-bold text-[var(--text)]">{stat.value}</div>
                <div className="mt-1 text-xs text-[var(--text-soft)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
            <h3 className="font-semibold text-[var(--text)]">Recent Bids</h3>
            <button type="button" onClick={() => navigate('/trip-requests')} className="text-sm font-medium text-[var(--primary)] hover:underline">
              View all
            </button>
          </div>
          <div className="mobile-record-list p-4 md:p-5">
            {recentBids.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No bid activity yet</div>
                <div className="empty-state-copy">Traveler negotiations will appear here once your agency starts replying to requests.</div>
              </div>
            ) : (
              recentBids.map((bid) => (
                <div key={bid.id} className="record-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="record-title">{bid.tripDestination || 'Trip request'}</div>
                      <div className="record-copy">{formatDateRange(bid.tripStartDate, bid.tripEndDate)}</div>
                    </div>
                    <span className={`app-pill ${
                      bid.status === 'ACCEPTED'
                        ? 'app-pill-success'
                        : bid.status === 'REJECTED'
                          ? 'app-pill-danger'
                          : bid.awaitingActionBy === 'AGENCY'
                            ? 'app-pill-warning'
                            : 'app-pill-neutral'
                    }`}>
                      {bid.status === 'PENDING'
                        ? (bid.awaitingActionBy === 'AGENCY' ? 'Agency turn' : 'Traveler review')
                        : bid.status}
                    </span>
                  </div>
                  <div className="record-grid">
                    <div className="record-meta-block">
                      <div className="record-meta-label">Quote</div>
                      <div className="record-meta-value">{formatCurrency(bid.price)}</div>
                    </div>
                    <div className="record-meta-block">
                      <div className="record-meta-label">Updated</div>
                      <div className="record-meta-value">{formatDate(bid.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
            <h3 className="font-semibold text-[var(--text)]">Recent Bookings</h3>
            <button type="button" onClick={() => navigate('/bookings')} className="text-sm font-medium text-[var(--primary)] hover:underline">
              View all
            </button>
          </div>
          <div className="mobile-record-list p-4 md:p-5">
            {recentBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No bookings yet</div>
                <div className="empty-state-copy">Confirmed trips will show up here as travelers accept your offers.</div>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="record-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="record-title">{booking.destination || 'Trip booking'}</div>
                      <div className="record-copy">
                        {booking.userName || 'Traveler'} · {formatDateRange(booking.startDate, booking.endDate)}
                      </div>
                    </div>
                    <span className={`app-pill ${
                      booking.status === 'CONFIRMED'
                        ? 'app-pill-success'
                        : booking.status === 'CANCELLED'
                          ? 'app-pill-danger'
                          : booking.status === 'COMPLETED'
                            ? 'app-pill-neutral'
                            : 'app-pill-warning'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="record-grid">
                    <div className="record-meta-block">
                      <div className="record-meta-label">Amount</div>
                      <div className="record-meta-value">{formatCurrency(booking.totalAmount)}</div>
                    </div>
                    <div className="record-meta-block">
                      <div className="record-meta-label">Updated</div>
                      <div className="record-meta-value">{formatDate(booking.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
