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
    { label: 'Create trip offer', copy: 'Publish a new itinerary.', path: '/packages/new' },
    { label: 'Review requests', copy: 'Reply to traveler demand.', path: '/trip-requests' },
    { label: 'Add hotel', copy: 'Expand stay inventory.', path: '/hotels/new' },
    { label: 'Add vehicle', copy: 'Keep fleet coverage ready.', path: '/transport/new' },
  ];

  const recentBids = [...bids]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 3);

  const recentBookings = [...bookings]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
            Welcome back, {user?.name || 'Agency'}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            Here's what's happening with your inventory and bookings today.
          </p>
        </div>

        <div className="page-stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-note">{stat.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="surface px-5 py-5 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="app-section-label">Quick actions</div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">Keep the pipeline moving</h3>
            </div>
            <div className="app-pill app-pill-success">Approved access</div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="record-card text-left"
              >
                <div className="record-title">{action.label}</div>
                <div className="record-copy">{action.copy}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="app-panel-dark px-5 py-5 md:px-6">
          <div className="app-section-label">Readiness</div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">Inventory snapshot</h3>
          <div className="mt-5 mobile-record-list">
            <div className="record-card">
              <div className="record-title">Hotels</div>
              <div className="record-copy">
                {hotelsLoading ? 'Loading hotel inventory...' : `${hotels.length} listings available for packaging.`}
              </div>
            </div>
            <div className="record-card">
              <div className="record-title">Vehicles</div>
              <div className="record-copy">
                {vehiclesLoading ? 'Loading fleet inventory...' : `${availableVehicles.length} available out of ${vehicles.length} total.`}
              </div>
            </div>
            <div className="record-card">
              <div className="record-title">Urgent negotiations</div>
              <div className="record-copy">
                {urgentNegotiations.length > 0
                  ? `${urgentNegotiations.length} active threads are waiting on agency follow-up.`
                  : 'No traveler threads are currently blocked on agency action.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface overflow-hidden">
          <div className="surface-header">
            <div>
              <div className="app-section-label">Negotiations</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-[var(--text)]">Recent bid activity</div>
            </div>
            <button type="button" onClick={() => navigate('/trip-requests')} className="app-btn-secondary h-10 px-4 text-sm">
              Open requests
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
          <div className="surface-header">
            <div>
              <div className="app-section-label">Bookings</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-[var(--text)]">Recent confirmed work</div>
            </div>
            <button type="button" onClick={() => navigate('/bookings')} className="app-btn-secondary h-10 px-4 text-sm">
              Open bookings
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
