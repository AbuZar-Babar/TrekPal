import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchBookings } from '../../bookings/store/bookingsSlice';
import { fetchVehicles } from '../../transport/store/transportSlice';
import { RootState } from '../../../store';
import { formatCurrency } from '../../../shared/utils/formatters';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user }     = useSelector((state: RootState) => state.auth);
  const { vehicles } = useSelector((state: RootState) => state.transport);
  const { bookings } = useSelector((state: RootState) => state.bookings);

  useEffect(() => {
    dispatch(fetchVehicles({ limit: 100 }) as any);
    dispatch(fetchBookings({ limit: 100 }) as any);
  }, [dispatch]);

  const available  = vehicles.filter((v) => v.isAvailable);
  const pending    = bookings.filter((b) => b.status === 'PENDING');
  const confirmed  = bookings.filter((b) => b.status === 'CONFIRMED');
  const completed  = bookings.filter((b) => b.status === 'COMPLETED');
  const revenue    = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5);

  const statusClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':  return 'bg-[var(--success-bg)] text-[var(--success-text)]';
      case 'COMPLETED':  return 'bg-[var(--success-bg)] text-[var(--success-text)]';
      case 'PENDING':    return 'bg-[var(--warning-bg)] text-[var(--warning-text)]';
      case 'CANCELLED':  return 'bg-[var(--danger-bg)] text-[var(--danger-text)]';
      default:           return 'bg-[var(--panel-strong)] text-[var(--text-muted)]';
    }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Dashboard</h1>
        <p className="mt-0.5 text-sm text-[var(--text-soft)]">
          Welcome back, {user?.name || 'Vehicle partner'} — here's your fleet at a glance
        </p>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Fleet size',       value: vehicles.length,  sub: `${available.length} available` },
          { label: 'Pending',          value: pending.length,   sub: `${confirmed.length} confirmed`, highlight: true },
          { label: 'Completed trips',  value: completed.length, sub: `${bookings.length} total` },
          { label: 'Revenue',          value: formatCurrency(revenue), sub: 'confirmed + completed' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">{s.label}</div>
            <div className={`mt-1 text-lg font-semibold tabular-nums ${s.highlight ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
              {s.value}
            </div>
            <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-column lower section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Fleet overview */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <div className="border-b border-[var(--border)] px-5 py-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Fleet overview</h2>
          </div>
          {vehicles.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-[var(--text-soft)]">
              No vehicles yet
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {vehicles.slice(0, 6).map((v) => (
                <div key={v.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium text-[var(--text)]">{v.make} {v.model}</div>
                    <div className="text-xs text-[var(--text-soft)]">{v.type} · {v.capacity} seats</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    v.isAvailable
                      ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                      : 'bg-[var(--danger-bg)] text-[var(--danger-text)]'
                  }`}>
                    {v.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              ))}
              {vehicles.length > 6 && (
                <div className="px-5 py-2 text-xs text-[var(--text-soft)]">
                  +{vehicles.length - 6} more vehicles
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <div className="border-b border-[var(--border)] px-5 py-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Recent bookings</h2>
          </div>
          {recentBookings.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-[var(--text-soft)]">
              No bookings yet
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium text-[var(--text)]">
                      {b.destination || 'Trip booking'}
                    </div>
                    <div className="text-xs text-[var(--text-soft)]">
                      {b.userName || 'Guest'} · {formatCurrency(b.totalAmount)}
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClass(b.status)}`}>
                    {b.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
