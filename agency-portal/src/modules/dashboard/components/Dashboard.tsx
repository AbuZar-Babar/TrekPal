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

  const stats = [
    { label: 'Traveler requests', value: tripRequests.length, path: '/trip-requests' },
    { label: 'Trip offers', value: packages.filter((item) => item.isActive).length, path: '/packages' },
    { label: 'Bookings', value: bookings.filter((item) => item.status !== 'CANCELLED').length, path: '/bookings' },
    { label: 'Inventory', value: hotels.length + vehicles.length, path: '/hotels' },
  ];

  const quickActions = [
    { label: 'New trip offer', path: '/packages/new' },
    { label: 'Review traveler requests', path: '/trip-requests' },
    { label: 'Add hotel', path: '/hotels/new' },
    { label: 'Add vehicle', path: '/transport/new' },
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
      <section className="app-card px-6 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="app-section-label">Welcome</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">
              {user?.name || 'Agency'}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Manage offers, traveler requests, bookings, hotels, and vehicles.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="app-btn-secondary h-11 px-4 text-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={() => navigate(stat.path)}
              className="app-kpi px-5 py-5 text-left transition hover:border-[var(--primary)]"
            >
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                {stat.label}
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)]">
                {stat.value}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
        <div className="app-table-shell">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <div className="app-section-label">Traveler requests</div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
                Recent bid activity
              </h3>
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
            <div className="app-section-label">Trip offers</div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
              Latest offers
            </h3>
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
                    className="app-card-subtle px-5 py-4 text-left"
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
                    <div className="mt-3 text-sm font-semibold text-[var(--text)]">
                      {formatCurrency(tripPackage.price)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="app-card px-6 py-6">
            <div className="app-section-label">Inventory</div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
              Hotels and vehicles
            </h3>
            <div className="mt-5 space-y-3">
              <div className="app-card-subtle px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-[var(--text)]">Hotels</span>
                  <span className="text-sm text-[var(--text-muted)]">
                    {hotelsLoading ? 'Loading...' : `${hotels.length} listed`}
                  </span>
                </div>
              </div>
              <div className="app-card-subtle px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-[var(--text)]">Vehicles</span>
                  <span className="text-sm text-[var(--text-muted)]">
                    {vehiclesLoading
                      ? 'Loading...'
                      : `${vehicles.filter((vehicle) => vehicle.isAvailable).length} available / ${vehicles.length} total`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="app-card px-6 py-6">
            <div className="app-section-label">Bookings</div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
              Recent bookings
            </h3>
            <div className="mt-5 space-y-3">
              {recentBookings.length === 0 ? (
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-4 text-sm text-[var(--text-muted)]">
                  No bookings yet.
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="app-card-subtle px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold tracking-tight text-[var(--text)]">
                          {booking.destination || 'Trip booking'}
                        </div>
                        <div className="mt-1 text-sm text-[var(--text-muted)]">
                          {booking.userName || 'Traveler'} - {formatDateRange(booking.startDate, booking.endDate)}
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
                    <div className="mt-3 text-sm font-semibold text-[var(--text)]">
                      {formatCurrency(booking.totalAmount)}
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
