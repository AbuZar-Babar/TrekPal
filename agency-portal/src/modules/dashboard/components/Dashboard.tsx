import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Card from '../../../shared/components/UI/Card';
import StatCard from '../../../shared/components/UI/StatCard';
import Badge from '../../../shared/components/UI/Badge';
import { fetchAgencyBids } from '../../bids/store/bidsSlice';
import { fetchBookings } from '../../bookings/store/bookingsSlice';
import { fetchHotels } from '../../hotels/store/hotelsSlice';
import { fetchPackages } from '../../packages/store/packagesSlice';
import { fetchTripRequests } from '../../tripRequests/store/tripRequestsSlice';
import { fetchVehicles } from '../../transport/store/transportSlice';
import { RootState } from '../../../store';
import { formatCurrency } from '../../../shared/utils/formatters';

const ic = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d={d} />
  </svg>
);

const Dashboard = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const { user }      = useSelector((state: RootState) => state.auth);
  const { vehicles }  = useSelector((state: RootState) => state.transport);
  const { hotels }    = useSelector((state: RootState) => state.hotels);
  const { packages }  = useSelector((state: RootState) => state.packages);
  const { bids }      = useSelector((state: RootState) => state.bids);
  const { bookings }  = useSelector((state: RootState) => state.bookings);
  const { tripRequests } = useSelector((state: RootState) => state.tripRequests);

  useEffect(() => {
    dispatch(fetchVehicles({ limit: 100 }) as any);
    dispatch(fetchHotels({ limit: 100 }) as any);
    dispatch(fetchPackages({ limit: 100 }) as any);
    dispatch(fetchAgencyBids({ limit: 100 }) as any);
    dispatch(fetchBookings({ limit: 100 }) as any);
    dispatch(fetchTripRequests({ limit: 100 }) as any);
  }, [dispatch]);

  // ── Calculations ──────────────────────────────────────────────────────────
  const activeOffers       = packages.filter((p) => p.isActive);
  const liveBookings       = bookings.filter((b) => b.status !== 'CANCELLED');
  const pendingBookings    = bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings  = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
  const confirmedRevenue   = confirmedBookings.reduce((s, b) => s + b.totalAmount, 0);
  const urgentBids         = bids.filter((b) => b.awaitingActionBy === 'AGENCY' && b.status === 'PENDING');
  const availableVehicles  = vehicles.filter((v) => v.isAvailable);
  const pendingRequests    = tripRequests.filter((t) => t.status === 'PENDING');

  const totalRooms = hotels.reduce(
    (s, h) => s + (h.rooms || []).reduce((rs, r) => rs + (r.quantity || 0), 0), 0,
  );
  const totalAvailableRooms = hotels.reduce(
    (s, h) => s + (h.rooms || []).reduce((rs, r) => rs + (r.availableQuantity ?? r.quantity ?? 0), 0), 0,
  );
  const bookedRooms        = Math.max(0, totalRooms - totalAvailableRooms);
  const roomOccupancy      = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;
  const vehicleUtilization = vehicles.length > 0
    ? Math.round(((vehicles.length - availableVehicles.length) / vehicles.length) * 100)
    : 0;

  const bookingStatusCounts = {
    CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
    PENDING:   bookings.filter((b) => b.status === 'PENDING').length,
    COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
  };
  const maxBookingCount = Math.max(1, ...Object.values(bookingStatusCounts));

  const totalPending = urgentBids.length + pendingRequests.length + pendingBookings.length;

  // ── KPI tiles ─────────────────────────────────────────────────────────────
  const kpis = [
    {
      label: 'Traveler requests',
      value: tripRequests.length,
      hint: `${pendingRequests.length} pending`,
      icon: ic('M13 10V3L4 14h7v7l9-11h-7z'),
      onClick: () => navigate('/trip-requests'),
    },
    {
      label: 'Published offers',
      value: activeOffers.length,
      hint: `${packages.length - activeOffers.length} draft`,
      icon: ic('M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10'),
      onClick: () => navigate('/packages'),
    },
    {
      label: 'Live bookings',
      value: liveBookings.length,
      hint: confirmedRevenue > 0 ? formatCurrency(confirmedRevenue) : 'None confirmed',
      icon: ic('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'),
      onClick: () => navigate('/bookings'),
    },
    {
      label: 'Ready inventory',
      value: hotels.length + availableVehicles.length,
      hint: `${availableVehicles.length} vehicles free`,
      icon: ic('M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m4-4v4'),
      onClick: () => navigate('/hotels'),
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Page title ───────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
            {user?.name || 'Agency'}
          </h1>
          <p className="mt-0.5 text-sm text-[var(--text-soft)]">
            {totalPending > 0
              ? `${totalPending} item${totalPending === 1 ? '' : 's'} need your attention`
              : 'All caught up — no pending actions'}
          </p>
        </div>
        {totalPending > 0 && (
          <Badge variant="warning" dot>{totalPending} pending</Badge>
        )}
      </div>

      {/* ── KPI row ──────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <StatCard
            key={k.label}
            label={k.label}
            value={k.value}
            hint={k.hint}
            icon={k.icon}
            onClick={k.onClick}
          />
        ))}
      </div>

      {/* ── Action Queue + Quick Stats ───────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Action Queue — 2/3 */}
        <Card title="Action needed" eyebrow="Pending work" className="lg:col-span-2">
          {totalPending === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--text-soft)]">
              ✓ All caught up
            </p>
          ) : (
            <div className="space-y-2">
              {[
                {
                  label: 'Bid negotiations',
                  sub: 'Awaiting your response',
                  count: urgentBids.length,
                  variant: 'warning' as const,
                  to: '/bids',
                },
                {
                  label: 'Trip requests',
                  sub: 'New inquiries to respond to',
                  count: pendingRequests.length,
                  variant: 'info' as const,
                  to: '/trip-requests',
                },
                {
                  label: 'Pending confirmations',
                  sub: 'Bookings awaiting approval',
                  count: pendingBookings.length,
                  variant: 'warning' as const,
                  to: '/bookings',
                },
              ].map((row) => (
                row.count > 0 && (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-[var(--text)]">{row.label}</div>
                      <div className="text-xs text-[var(--text-soft)]">{row.sub}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={row.variant} dot>{row.count}</Badge>
                      <button
                        onClick={() => navigate(row.to)}
                        className="text-xs font-semibold text-[var(--primary)] hover:underline"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </Card>

        {/* Quick Snapshot — 1/3 */}
        <Card title="Snapshot" eyebrow="Performance">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-[var(--text-soft)]">Conversion rate</span>
                <span className="text-sm font-semibold text-[var(--text)]">
                  {tripRequests.length > 0
                    ? Math.round((confirmedBookings.length / tripRequests.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--panel-subtle)]">
                <div
                  className="h-1.5 rounded-full bg-[var(--primary)] transition-all"
                  style={{ width: `${tripRequests.length > 0 ? Math.round((confirmedBookings.length / tripRequests.length) * 100) : 0}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-[var(--text-soft)]">
                {confirmedBookings.length} of {tripRequests.length} requests
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-soft)]">Avg booking value</span>
                <span className="text-xs font-semibold text-[var(--text)]">
                  {confirmedBookings.length > 0
                    ? formatCurrency(confirmedRevenue / confirmedBookings.length)
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-soft)]">Total revenue</span>
                <span className="text-xs font-semibold text-[var(--text)]">
                  {confirmedRevenue > 0 ? formatCurrency(confirmedRevenue) : '—'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Charts ───────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Booking Status */}
        <Card title="Booking status" eyebrow="Current distribution">
          <div className="space-y-3">
            {(Object.entries(bookingStatusCounts) as [string, number][]).map(([status, count]) => {
              const w = Math.max(4, Math.round((count / maxBookingCount) * 100));
              const barColor: Record<string, string> = {
                CONFIRMED: 'bg-[var(--success-text)]',
                PENDING:   'bg-[var(--warning-text)]',
                COMPLETED: 'bg-[var(--primary)]',
                CANCELLED: 'bg-[var(--danger-text)]',
              };
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)]">
                      {status}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text)]">{count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--panel-subtle)]">
                    <div
                      className={`h-1.5 rounded-full transition-all ${barColor[status]}`}
                      style={{ width: `${count === 0 ? 0 : w}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Inventory Utilization */}
        <Card title="Capacity utilization" eyebrow="Active usage">
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)]">
                  Room occupancy
                </span>
                <span className="text-xs font-semibold text-[var(--text)]">{roomOccupancy}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--panel-subtle)]">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${roomOccupancy}%`, background: 'var(--success-text)' }}
                />
              </div>
              <div className="mt-1 text-[11px] text-[var(--text-soft)]">
                {bookedRooms} of {totalRooms} rooms booked
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)]">
                  Vehicle utilization
                </span>
                <span className="text-xs font-semibold text-[var(--text)]">{vehicleUtilization}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--panel-subtle)]">
                <div
                  className="h-1.5 rounded-full transition-all bg-[var(--primary)]"
                  style={{ width: `${vehicleUtilization}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-[var(--text-soft)]">
                {vehicles.length - availableVehicles.length} of {vehicles.length} in use
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
