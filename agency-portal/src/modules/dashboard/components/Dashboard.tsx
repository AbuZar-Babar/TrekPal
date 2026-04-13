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
import {
  formatCurrency,
  formatDate,
  formatDateRange,
} from '../../../shared/utils/formatters';

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
  const confirmedBookings = bookings.filter((booking) => booking.status === 'CONFIRMED' || booking.status === 'COMPLETED');
  const availableVehicles = vehicles.filter((vehicle) => vehicle.isAvailable);
  const hiddenOffers = packages.filter((tripPackage) => !tripPackage.isActive);
  const inventoryCount = hotels.length + vehicles.length;
  const uniqueDestinations = new Set(
    packages.flatMap((tripPackage) => tripPackage.destinations.map((destination) => destination.trim().toLowerCase())).filter(Boolean),
  );
  const confirmedRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const availabilityRate = vehicles.length === 0 ? 0 : Math.round((availableVehicles.length / vehicles.length) * 100);

  const stats = [
    {
      label: 'Traveler requests',
      value: tripRequests.length,
      hint: `${urgentNegotiations.length} need agency action`,
      accent: 'Requests desk',
      path: '/trip-requests',
    },
    {
      label: 'Published offers',
      value: activeOffers.length,
      hint: `${hiddenOffers.length} hidden drafts`,
      accent: 'Offer board',
      path: '/packages',
    },
    {
      label: 'Live bookings',
      value: liveBookings.length,
      hint: `${confirmedBookings.length} confirmed or completed`,
      accent: 'Operations lane',
      path: '/bookings',
    },
    {
      label: 'Inventory units',
      value: inventoryCount,
      hint: `${availableVehicles.length} vehicles available`,
      accent: 'Field assets',
      path: '/hotels',
    },
  ];

  const quickActions = [
    { label: 'Launch new trip offer', description: 'Publish a new itinerary for travelers.', path: '/packages/new' },
    { label: 'Review open requests', description: 'Respond to travelers waiting on bids.', path: '/trip-requests' },
    { label: 'Add hotel inventory', description: 'Expand your available stay options.', path: '/hotels/new' },
    { label: 'Add a vehicle', description: 'Keep transport capacity ready.', path: '/transport/new' },
  ];

  const focusBoard = [
    {
      title: 'Urgent negotiations',
      value: urgentNegotiations.length,
      detail: urgentNegotiations.length > 0 ? 'Traveler threads are waiting on your revision.' : 'No traveler threads are blocked on agency action.',
      toneClass: urgentNegotiations.length > 0 ? 'app-pill-warning' : 'app-pill-success',
      toneLabel: urgentNegotiations.length > 0 ? 'Act now' : 'On track',
    },
    {
      title: 'Confirmed revenue',
      value: formatCurrency(confirmedRevenue),
      detail: `${confirmedBookings.length} bookings are already secured on the board.`,
      toneClass: 'app-pill-success',
      toneLabel: 'Locked',
    },
    {
      title: 'Destination spread',
      value: uniqueDestinations.size,
      detail: 'Active catalog depth across your current offer lineup.',
      toneClass: 'app-pill-neutral',
      toneLabel: 'Coverage',
    },
  ];

  const recentBids = [...bids]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 4);

  const recentOffers = [...packages]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 3);

  const recentBookings = [...bookings]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="dashboard-hero">
        <div className="dashboard-hero-grid">
          <div>
            <div className="dashboard-eyebrow">Expedition control room</div>
            <h2 className="dashboard-hero-title">
              {user?.name || 'Agency'} is steering traveler demand, live inventory, and active negotiations from one board.
            </h2>
            <p className="dashboard-hero-copy">
              This view prioritizes the next commercial move: what needs a reply, what is already sold, and where your catalog is ready to scale.
            </p>

            <div className="dashboard-action-grid">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className="dashboard-action-card"
                >
                  <span className="dashboard-action-title">{action.label}</span>
                  <span className="dashboard-action-copy">{action.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-control-panel">
            <div className="dashboard-control-head">
              <div>
                <div className="app-section-label text-white/60">Today&apos;s readout</div>
                <h3 className="dashboard-panel-title">Route signals</h3>
              </div>
              <div className="dashboard-orb" aria-hidden="true" />
            </div>

            <div className="dashboard-focus-list">
              {focusBoard.map((item) => (
                <div key={item.title} className="dashboard-focus-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="dashboard-focus-label">{item.title}</div>
                      <div className="dashboard-focus-value">{item.value}</div>
                    </div>
                    <span className={`app-pill ${item.toneClass}`}>{item.toneLabel}</span>
                  </div>
                  <p className="dashboard-focus-copy">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="dashboard-mini-grid">
              <div className="dashboard-mini-stat">
                <span className="dashboard-mini-label">Vehicles ready</span>
                <span className="dashboard-mini-value">
                  {vehiclesLoading ? '...' : `${availabilityRate}%`}
                </span>
              </div>
              <div className="dashboard-mini-stat">
                <span className="dashboard-mini-label">Hotels listed</span>
                <span className="dashboard-mini-value">
                  {hotelsLoading ? '...' : hotels.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => navigate(stat.path)}
            className="dashboard-stat-card text-left"
          >
            <div className="dashboard-stat-accent">{stat.accent}</div>
            <div className="dashboard-stat-label">{stat.label}</div>
            <div className="dashboard-stat-value">{stat.value}</div>
            <div className="dashboard-stat-hint">{stat.hint}</div>
          </button>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
        <div className="app-table-shell overflow-hidden">
          <div className="dashboard-section-head">
            <div>
              <div className="app-section-label">Negotiation traffic</div>
              <h3 className="dashboard-section-title">Recent bid activity</h3>
              <p className="dashboard-section-copy">The latest movement across traveler threads, revisions, and offer approvals.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/trip-requests')}
              className="app-btn-secondary h-11 px-4 text-sm"
            >
              Open requests
            </button>
          </div>

          {recentBids.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
                No bid activity yet
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Traveler requests will appear here when you start bidding.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="app-table min-w-full">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Offer</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBids.map((bid) => (
                    <tr key={bid.id}>
                      <td>
                        <div className="font-semibold tracking-tight text-[var(--text)]">
                          {bid.tripDestination || 'Trip request'}
                        </div>
                        <div className="mt-1 text-sm text-[var(--text-muted)]">
                          {formatDateRange(bid.tripStartDate, bid.tripEndDate)}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold tracking-tight text-[var(--text)]">
                          {formatCurrency(bid.price)}
                        </div>
                        <div className="mt-1 text-sm text-[var(--text-muted)]">
                          {bid.revisionCount} revision(s)
                        </div>
                      </td>
                      <td>
                        <span
                          className={`app-pill ${
                            bid.status === 'ACCEPTED'
                              ? 'app-pill-success'
                              : bid.status === 'REJECTED'
                                ? 'app-pill-danger'
                                : bid.awaitingActionBy === 'AGENCY'
                                  ? 'app-pill-warning'
                                  : 'app-pill-neutral'
                          }`}
                        >
                          {bid.status === 'PENDING'
                            ? (bid.awaitingActionBy === 'AGENCY' ? 'Agency turn' : 'Traveler review')
                            : bid.status}
                        </span>
                      </td>
                      <td>{formatDate(bid.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="app-card px-6 py-6">
            <div className="app-section-label">Offer catalog</div>
            <h3 className="dashboard-section-title mt-2">Latest offers</h3>
            <p className="dashboard-section-copy mt-2">Fresh itinerary updates and publish state across your package lineup.</p>
            <div className="mt-5 grid gap-4">
              {recentOffers.length === 0 ? (
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-4 text-sm text-[var(--text-muted)]">
                  No trip offers yet.
                </div>
              ) : (
                recentOffers.map((tripPackage) => (
                  <button
                    key={tripPackage.id}
                    type="button"
                    onClick={() => navigate(`/packages/${tripPackage.id}/edit`)}
                    className="dashboard-list-card text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold tracking-tight text-[var(--text)]">
                          {tripPackage.name}
                        </div>
                        <div className="mt-1 text-sm text-[var(--text-muted)]">
                          {tripPackage.destinations.join(', ')}
                        </div>
                      </div>
                      <span className={`app-pill ${tripPackage.isActive ? 'app-pill-success' : 'app-pill-neutral'}`}>
                        {tripPackage.isActive ? 'Published' : 'Hidden'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="text-sm font-semibold text-[var(--text)]">
                        {formatCurrency(tripPackage.price)}
                      </div>
                      <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">
                        Offer desk
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="app-card px-6 py-6">
            <div className="app-section-label">Asset readiness</div>
            <h3 className="dashboard-section-title mt-2">Hotels and vehicles</h3>
            <p className="dashboard-section-copy mt-2">Capacity that can support the next wave of confirmed travelers.</p>
            <div className="mt-5 grid gap-3">
              <div className="dashboard-list-card">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-[var(--text)]">Hotels</span>
                  <span className="text-sm text-[var(--text-muted)]">
                    {hotelsLoading ? 'Loading...' : `${hotels.length} listed`}
                  </span>
                </div>
              </div>
              <div className="dashboard-list-card">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-[var(--text)]">Vehicles</span>
                  <span className="text-sm text-[var(--text-muted)]">
                    {vehiclesLoading
                      ? 'Loading...'
                      : `${availableVehicles.length} available / ${vehicles.length} total`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="app-card px-6 py-6">
            <div className="app-section-label">Booked work</div>
            <h3 className="dashboard-section-title mt-2">Recent bookings</h3>
            <p className="dashboard-section-copy mt-2">Accepted trips and traveler commitments that already require delivery.</p>
            <div className="mt-5 space-y-3">
              {recentBookings.length === 0 ? (
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-4 text-sm text-[var(--text-muted)]">
                  No bookings yet.
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="dashboard-list-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold tracking-tight text-[var(--text)]">
                          {booking.destination || 'Trip booking'}
                        </div>
                        <div className="mt-1 text-sm text-[var(--text-muted)]">
                          {booking.userName || 'Traveler'} - {formatDateRange(booking.startDate, booking.endDate)}
                        </div>
                      </div>
                      <span
                        className={`app-pill ${
                          booking.status === 'CONFIRMED'
                            ? 'app-pill-success'
                            : booking.status === 'CANCELLED'
                              ? 'app-pill-danger'
                              : booking.status === 'COMPLETED'
                                ? 'app-pill-neutral'
                                : 'app-pill-warning'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="text-sm font-semibold text-[var(--text)]">
                        {formatCurrency(booking.totalAmount)}
                      </div>
                      <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">
                        Updated {formatDate(booking.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
