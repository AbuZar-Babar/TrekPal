import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { fetchAgencyBids } from '../../bids/store/bidsSlice';
import { fetchBookings } from '../../bookings/store/bookingsSlice';
import { fetchHotels } from '../../hotels/store/hotelsSlice';
import { fetchTripRequests } from '../../tripRequests/store/tripRequestsSlice';
import { fetchVehicles } from '../../transport/store/transportSlice';
import { RootState } from '../../../store';
import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatDateRange,
  formatStatusLabel,
} from '../../../shared/utils/formatters';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  const { vehicles, loading: vehiclesLoading } = useSelector((state: RootState) => state.transport);
  const { hotels, loading: hotelsLoading } = useSelector((state: RootState) => state.hotels);
  const { bids } = useSelector((state: RootState) => state.bids);
  const { bookings } = useSelector((state: RootState) => state.bookings);
  const { tripRequests } = useSelector((state: RootState) => state.tripRequests);

  useEffect(() => {
    dispatch(fetchVehicles({ limit: 100 }) as any);
    dispatch(fetchHotels({ limit: 100 }) as any);
    dispatch(fetchAgencyBids({ limit: 100 }) as any);
    dispatch(fetchBookings({ limit: 100 }) as any);
    dispatch(fetchTripRequests({ limit: 100 }) as any);
  }, [dispatch]);

  const stats = [
    {
      label: 'Open marketplace briefs',
      value: formatCompactNumber(tripRequests.length),
      detail: 'Traveler requests currently visible to your agency',
    },
    {
      label: 'Live offer threads',
      value: formatCompactNumber(bids.filter((bid) => bid.status === 'PENDING').length),
      detail: `${bids.filter((bid) => bid.awaitingActionBy === 'AGENCY' && bid.status === 'PENDING').length} waiting on agency action`,
    },
    {
      label: 'Confirmed bookings',
      value: formatCompactNumber(bookings.filter((booking) => booking.status === 'CONFIRMED').length),
      detail: `${bookings.filter((booking) => booking.status === 'COMPLETED').length} completed trips`,
    },
    {
      label: 'Managed inventory',
      value: formatCompactNumber(vehicles.length + hotels.length),
      detail: `${vehicles.length} vehicles and ${hotels.length} hotels currently in the workspace`,
    },
  ];

  const recentBids = [...bids]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 5);

  const recentBookings = [...bookings]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 4);

  const quickActions = [
    { label: 'Review marketplace', description: 'Inspect traveler briefs and quote actively', path: '/trip-requests' },
    { label: 'Add hotel', description: 'Expand stay inventory for upcoming offers', path: '/hotels/new' },
    { label: 'Add vehicle', description: 'Increase transport capacity in the portal', path: '/transport/new' },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="app-card px-6 py-6 md:px-8 md:py-8">
          <div className="app-section-label">Overview</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">
            Welcome back, {user?.name || 'Agency'}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            This dashboard mirrors the TrekPal agency operations view: a clear read on marketplace activity, negotiation load, bookings in flight, and inventory readiness.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="app-kpi px-5 py-5">
                <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">{stat.label}</div>
                <div className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)]">{stat.value}</div>
                <div className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="app-panel-dark px-6 py-6">
          <div className="app-section-label text-white/55">Quick actions</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Keep the queue moving</h2>
          <div className="mt-6 space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="w-full rounded-[22px] border border-white/8 bg-white/6 px-4 py-4 text-left transition hover:bg-white/10"
              >
                <div className="text-sm font-semibold tracking-tight text-white">{action.label}</div>
                <div className="mt-1 text-sm leading-6 text-white/66">{action.description}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[22px] border border-white/8 bg-white/6 px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Today</div>
            <div className="mt-2 text-sm leading-7 text-white/72">
              {bids.filter((bid) => bid.awaitingActionBy === 'AGENCY' && bid.status === 'PENDING').length} negotiation thread(s) are currently waiting on an agency revision.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.18fr,0.82fr]">
        <div className="app-table-shell">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <div className="app-section-label">Negotiation queue</div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">Recent offer threads</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/trip-requests')}
              className="app-btn-secondary h-11 px-4 text-sm"
            >
              Open marketplace
            </button>
          </div>

          {recentBids.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-lg font-semibold tracking-tight text-[var(--text)]">No offer threads yet</div>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                New traveler briefs and negotiations will appear here once the agency starts quoting.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="app-table min-w-full">
                <thead>
                  <tr>
                    <th>Trip brief</th>
                    <th>Current offer</th>
                    <th>Next move</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBids.map((bid) => (
                    <tr key={bid.id}>
                      <td>
                        <div className="font-semibold tracking-tight text-[var(--text)]">{bid.tripDestination || 'Trip request'}</div>
                        <div className="mt-1 text-sm text-[var(--text-muted)]">
                          {formatDateRange(bid.tripStartDate, bid.tripEndDate)}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold tracking-tight text-[var(--text)]">{formatCurrency(bid.price)}</div>
                        <div className="mt-1 text-sm text-[var(--text-muted)]">{bid.revisionCount} revision(s)</div>
                      </td>
                      <td>
                        <div className={`app-pill ${bid.awaitingActionBy === 'AGENCY' && bid.status === 'PENDING' ? 'app-pill-warning' : bid.status === 'ACCEPTED' ? 'app-pill-success' : bid.status === 'REJECTED' ? 'app-pill-danger' : 'app-pill-neutral'}`}>
                          {bid.status === 'PENDING' ? (bid.awaitingActionBy === 'AGENCY' ? 'Agency turn' : 'Traveler review') : formatStatusLabel(bid.status)}
                        </div>
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
            <div className="app-section-label">Inventory summary</div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">Readiness by asset type</h3>
            <div className="mt-5 grid gap-4">
              <div className="app-card-subtle px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-[var(--text)]">Vehicles</span>
                  <span className="text-sm text-[var(--text-muted)]">
                    {vehiclesLoading ? 'Loading...' : `${vehicles.filter((vehicle) => vehicle.isAvailable).length} available / ${vehicles.length} total`}
                  </span>
                </div>
              </div>
              <div className="app-card-subtle px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-[var(--text)]">Hotels</span>
                  <span className="text-sm text-[var(--text-muted)]">
                    {hotelsLoading ? 'Loading...' : `${hotels.length} listed properties in the workspace`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="app-card px-6 py-6">
            <div className="app-section-label">Bookings</div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">Recent trip handling</h3>
            <div className="mt-5 space-y-3">
              {recentBookings.length === 0 ? (
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-4 text-sm leading-7 text-[var(--text-muted)]">
                  Accepted bookings will appear here after a traveler chooses one of your offers.
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="app-card-subtle px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold tracking-tight text-[var(--text)]">{booking.destination || 'Trip booking'}</div>
                        <div className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                          {booking.userName || 'Traveler'} • {formatDateRange(booking.startDate, booking.endDate)}
                        </div>
                      </div>
                      <div className={`app-pill ${booking.status === 'CONFIRMED' ? 'app-pill-success' : booking.status === 'CANCELLED' ? 'app-pill-danger' : booking.status === 'COMPLETED' ? 'app-pill-neutral' : 'app-pill-warning'}`}>
                        {formatStatusLabel(booking.status)}
                      </div>
                    </div>
                    <div className="mt-3 text-sm font-semibold text-[var(--text)]">{formatCurrency(booking.totalAmount)}</div>
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
