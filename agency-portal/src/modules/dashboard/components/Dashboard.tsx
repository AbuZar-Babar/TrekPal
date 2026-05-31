import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../../../shared/components/UI/PageHeader';
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

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

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

  // ─── Calculations ────────────────────────────────────────────────────────────
  const activeOffers = packages.filter((item) => item.isActive);
  const liveBookings = bookings.filter((item) => item.status !== 'CANCELLED');
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
  const confirmedRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  const urgentBids = bids.filter((bid) => bid.awaitingActionBy === 'AGENCY' && bid.status === 'PENDING');
  const availableVehicles = vehicles.filter((vehicle) => vehicle.isAvailable);
  const pendingTripRequests = tripRequests.filter((tr) => tr.status === 'PENDING');

  const totalRooms = hotels.reduce(
    (sum, hotel) => sum + (hotel.rooms || []).reduce((roomSum, room) => roomSum + (room.quantity || 0), 0),
    0,
  );
  const totalAvailableRooms = hotels.reduce(
    (sum, hotel) =>
      sum +
      (hotel.rooms || []).reduce(
        (roomSum, room) => roomSum + (room.availableQuantity ?? room.quantity ?? 0),
        0,
      ),
    0,
  );
  const bookedRooms = Math.max(0, totalRooms - totalAvailableRooms);
  const roomOccupancy = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;
  const vehicleUtilization =
    vehicles.length > 0 ? Math.round(((vehicles.length - availableVehicles.length) / vehicles.length) * 100) : 0;

  const bookingStatusCounts = {
    CONFIRMED: bookings.filter((booking) => booking.status === 'CONFIRMED').length,
    PENDING: bookings.filter((booking) => booking.status === 'PENDING').length,
    COMPLETED: bookings.filter((booking) => booking.status === 'COMPLETED').length,
    CANCELLED: bookings.filter((booking) => booking.status === 'CANCELLED').length,
  };
  const maxBookingCount = Math.max(1, ...Object.values(bookingStatusCounts));

  const stats = [
    {
      label: 'Traveler requests',
      value: tripRequests.length,
      hint: `${pendingTripRequests.length} pending`,
      icon: icon('M13 10V3L4 14h7v7l9-11h-7z'),
      onClick: () => navigate('/trip-requests'),
    },
    {
      label: 'Published offers',
      value: activeOffers.length,
      hint: `${packages.length - activeOffers.length} draft`,
      icon: icon('M12 8c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4zm5-8h-3v2h3v3h2v-3h3v-2h-3V2h-2z'),
      onClick: () => navigate('/packages'),
    },
    {
      label: 'Live bookings',
      value: liveBookings.length,
      hint: confirmedRevenue > 0 ? formatCurrency(confirmedRevenue) : 'None confirmed',
      icon: icon('M3 13a9 9 0 1 0 18 0A9 9 0 0 0 3 13zm9-7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 4a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-3a1 1 0 0 0-1-1z'),
      onClick: () => navigate('/bookings'),
    },
    {
      label: 'Ready inventory',
      value: hotels.length + availableVehicles.length,
      hint: `${availableVehicles.length} vehicles free`,
      icon: icon('M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m4-4v4'),
      onClick: () => navigate('/hotels'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title={`Welcome back, ${user?.name || 'Agency'}`}
        subtitle="Track your bookings, offers, and performance in real time"
        actions={
          <button
            onClick={() => navigate('/packages')}
            className="app-btn-primary app-btn-md"
          >
            New offer
          </button>
        }
      />

      {/* ── KPI StatCards ───────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            icon={stat.icon}
            onClick={stat.onClick}
          />
        ))}
      </div>

      {/* ── Action Queue + Quick Stats ──────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Action Queue */}
        <Card title="Action needed" eyebrow="Pending work" className="lg:col-span-2">
          <div className="space-y-3">
            {/* Pending negotiations */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--panel-subtle)] border border-[var(--border)]">
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--text)]">Bid negotiations</div>
                <div className="text-xs text-[var(--text-soft)]">Awaiting your response</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="warning" dot>
                  {urgentBids.length}
                </Badge>
                <button
                  onClick={() => navigate('/bids')}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  View →
                </button>
              </div>
            </div>

            {/* Pending trip requests */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--panel-subtle)] border border-[var(--border)]">
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--text)]">Trip requests</div>
                <div className="text-xs text-[var(--text-soft)]">New inquiries to respond to</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="info" dot>
                  {pendingTripRequests.length}
                </Badge>
                <button
                  onClick={() => navigate('/trip-requests')}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  View →
                </button>
              </div>
            </div>

            {/* Pending bookings */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--panel-subtle)] border border-[var(--border)]">
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--text)]">Pending confirmations</div>
                <div className="text-xs text-[var(--text-soft)]">Bookings awaiting your approval</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="warning" dot>
                  {pendingBookings.length}
                </Badge>
                <button
                  onClick={() => navigate('/bookings')}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  View →
                </button>
              </div>
            </div>

            {urgentBids.length === 0 && pendingTripRequests.length === 0 && pendingBookings.length === 0 && (
              <div className="text-center py-6 text-sm text-[var(--text-soft)]">
                ✓ All caught up! No pending actions.
              </div>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card title="Quick snapshot" eyebrow="Performance">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[var(--text-soft)]">Conversion rate</span>
                <span className="text-sm font-semibold text-[var(--text)]">
                  {tripRequests.length > 0
                    ? Math.round((confirmedBookings.length / tripRequests.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--panel-subtle)]">
                <div
                  className="h-2 rounded-full bg-[var(--primary)]"
                  style={{
                    width: `${
                      tripRequests.length > 0
                        ? Math.round((confirmedBookings.length / tripRequests.length) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                {confirmedBookings.length} of {tripRequests.length} requests
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[var(--text-soft)]">Avg booking value</span>
                <span className="text-sm font-semibold text-[var(--text)]">
                  {confirmedBookings.length > 0
                    ? formatCurrency(confirmedRevenue / confirmedBookings.length)
                    : 'N/A'}
                </span>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {confirmedBookings.length} confirmed bookings
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-soft)]">Response time</span>
                <span className="text-sm font-semibold text-[var(--text)]">
                  {urgentBids.length > 0 ? 'Check bids' : '✓ Good'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Charts ──────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Booking Status Distribution */}
        <Card title="Booking status" eyebrow="Current distribution">
          <div className="space-y-3">
            {Object.entries(bookingStatusCounts).map(([status, count]) => {
              const width = Math.max(8, Math.round((count / maxBookingCount) * 100));
              const colorMap: Record<string, string> = {
                CONFIRMED: 'bg-[var(--success-bg)]',
                PENDING: 'bg-[var(--warning-bg)]',
                COMPLETED: 'bg-[var(--primary)]',
                CANCELLED: 'bg-[var(--danger-bg)]',
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[var(--text-soft)] uppercase tracking-wide">
                      {status}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text)]">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--panel-subtle)]">
                    <div
                      className={`h-2 rounded-full transition-all ${colorMap[status]}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Inventory Utilization */}
        <Card title="Capacity utilization" eyebrow="Active usage">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[var(--text-soft)] uppercase tracking-wide">
                  Room occupancy
                </span>
                <span className="text-sm font-semibold text-[var(--text)]">{roomOccupancy}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--panel-subtle)]">
                <div
                  className="h-2 rounded-full bg-[#10b981]"
                  style={{ width: `${roomOccupancy}%` }}
                />
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                {bookedRooms} of {totalRooms} rooms booked
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[var(--text-soft)] uppercase tracking-wide">
                  Vehicle utilization
                </span>
                <span className="text-sm font-semibold text-[var(--text)]">{vehicleUtilization}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--panel-subtle)]">
                <div
                  className="h-2 rounded-full bg-[#0ea5e9]"
                  style={{ width: `${vehicleUtilization}%` }}
                />
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
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
