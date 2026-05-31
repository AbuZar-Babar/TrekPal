import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../store';
import { formatCurrency, formatDateRange, formatShortId } from '../../../shared/utils/formatters';
import { fetchBookings, updateBookingStatus } from '../store/bookingsSlice';

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_TABS = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const cfg: Record<BookingStatus, { label: string; cls: string }> = {
    PENDING:   { label: 'Pending',   cls: 'bg-[var(--warning-bg)] text-[var(--warning-text)]' },
    CONFIRMED: { label: 'Confirmed', cls: 'bg-[var(--success-bg)] text-[var(--success-text)]' },
    COMPLETED: { label: 'Completed', cls: 'bg-[var(--panel-strong)] text-[var(--text-muted)]' },
    CANCELLED: { label: 'Cancelled', cls: 'bg-[var(--danger-bg)] text-[var(--danger-text)]' },
  };
  const { label, cls } = cfg[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const BookingList = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error, updatingId, pagination } = useSelector(
    (state: RootState) => state.bookings,
  );

  const [page, setPage]         = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchBookings({ page, limit: 20, status: statusFilter || undefined }) as any);
  }, [dispatch, page, statusFilter]);

  const handleStatus = async (id: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    try { await dispatch(updateBookingStatus({ id, status }) as any).unwrap(); } catch { /* handled */ }
  };

  // Mini stats (computed from current page — fine for overview)
  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
    revenue:   bookings
      .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((s, b) => s + b.totalAmount, 0),
  }), [bookings]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-5">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Bookings</h1>
        <p className="mt-0.5 text-sm text-[var(--text-soft)]">
          {pagination.total} total · confirm, complete, or cancel active trips
        </p>
      </div>

      {/* ── Mini stats strip ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'This page',  value: stats.total },
          { label: 'Pending',    value: stats.pending,   highlight: stats.pending > 0 },
          { label: 'Confirmed',  value: stats.confirmed  },
          { label: 'Revenue',    value: formatCurrency(stats.revenue) },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">{s.label}</div>
            <div className={`mt-1 text-lg font-semibold tabular-nums ${s.highlight ? 'text-[var(--warning-text)]' : 'text-[var(--text)]'}`}>
              {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab filters ─────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button
            key={s || 'ALL'}
            type="button"
            onClick={() => { setPage(1); setStatusFilter(s); }}
            className={`h-8 rounded-lg px-3.5 text-xs font-semibold transition-colors ${
              statusFilter === s
                ? 'bg-[var(--primary)] text-white'
                : 'border border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[var(--text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-[var(--text-soft)]">No bookings found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 border-b border-[var(--border)] bg-[var(--panel-subtle)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-soft)]
            max-md:hidden">
            <div>Trip</div>
            <div className="w-32 text-center">Dates</div>
            <div className="w-28 text-right">Amount</div>
            <div className="w-24 text-center">Status</div>
            <div className="w-40 text-right">Actions</div>
          </div>

          {/* Rows */}
          {bookings.map((booking, i) => {
            const isUpdating = updatingId === booking.id;
            const actions: { label: string; status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'; primary?: boolean }[] =
              booking.status === 'PENDING'
                ? [
                    { label: 'Confirm',  status: 'CONFIRMED',  primary: true },
                    { label: 'Cancel',   status: 'CANCELLED' },
                  ]
                : booking.status === 'CONFIRMED'
                  ? [
                      { label: 'Complete', status: 'COMPLETED', primary: true },
                      { label: 'Cancel',   status: 'CANCELLED' },
                    ]
                  : [];

            return (
              <div
                key={booking.id}
                className={`border-b border-[var(--border)] px-5 py-4 last:border-b-0 ${i % 2 === 1 ? 'bg-[var(--panel-subtle)]' : ''}`}
              >
                {/* Mobile layout */}
                <div className="space-y-3 md:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-[var(--text)]">{booking.destination || 'Trip booking'}</div>
                      <div className="text-xs text-[var(--text-soft)]">
                        {booking.userName || 'Guest'} · #{formatShortId(booking.id)}
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                    <span>{formatDateRange(booking.startDate, booking.endDate)}</span>
                    <span className="font-semibold text-[var(--text)]">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                  {actions.length > 0 && (
                    <div className="flex gap-2">
                      {actions.map((a) => (
                        <button
                          key={a.status}
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatus(booking.id, a.status)}
                          className={`h-7 flex-1 rounded-lg px-3 text-xs font-semibold transition-colors disabled:opacity-50 ${
                            a.primary
                              ? 'bg-[var(--primary)] text-white hover:opacity-90'
                              : 'border border-[var(--border)] text-[var(--danger-text)] hover:bg-[var(--danger-bg)]'
                          }`}
                        >
                          {isUpdating ? '…' : a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop layout */}
                <div className="hidden items-center gap-0 md:grid" style={{ gridTemplateColumns: '1fr auto auto auto auto' }}>
                  <div className="min-w-0 pr-4">
                    <div className="truncate font-medium text-[var(--text)]">{booking.destination || 'Trip booking'}</div>
                    <div className="text-xs text-[var(--text-soft)]">
                      {booking.userName || 'Guest'} · #{formatShortId(booking.id)}
                    </div>
                  </div>
                  <div className="w-32 text-center text-xs text-[var(--text-muted)]">
                    {formatDateRange(booking.startDate, booking.endDate)}
                  </div>
                  <div className="w-28 text-right text-sm font-semibold text-[var(--text)] tabular-nums">
                    {formatCurrency(booking.totalAmount)}
                  </div>
                  <div className="w-24 flex justify-center">
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="w-40 flex justify-end gap-2">
                    {actions.length === 0 ? (
                      <span className="text-xs text-[var(--text-soft)]">—</span>
                    ) : (
                      actions.map((a) => (
                        <button
                          key={a.status}
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatus(booking.id, a.status)}
                          className={`h-7 rounded-lg px-3 text-xs font-semibold transition-colors disabled:opacity-50 ${
                            a.primary
                              ? 'bg-[var(--primary)] text-white hover:opacity-90'
                              : 'border border-[var(--border)] text-[var(--danger-text)] hover:bg-[var(--danger-bg)]'
                          }`}
                        >
                          {isUpdating ? '…' : a.label}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium disabled:opacity-40">
            ← Prev
          </button>
          <span className="text-xs text-[var(--text-soft)]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
            className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingList;
