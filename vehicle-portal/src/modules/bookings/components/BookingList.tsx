import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../store';
import {
  formatCurrency,
  formatDateRange,
  formatShortId,
  formatStatusLabel,
} from '../../../shared/utils/formatters';
import { fetchBookings, updateBookingStatus } from '../store/bookingsSlice';

const statusClass = (status: string) => {
  switch (status) {
    case 'CONFIRMED':  return 'bg-[var(--success-bg)] text-[var(--success-text)]';
    case 'COMPLETED':  return 'bg-[var(--success-bg)] text-[var(--success-text)]';
    case 'PENDING':    return 'bg-[var(--warning-bg)] text-[var(--warning-text)]';
    case 'CANCELLED':  return 'bg-[var(--danger-bg)] text-[var(--danger-text)]';
    default:           return 'bg-[var(--panel-strong)] text-[var(--text-muted)]';
  }
};

const BookingList = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error, updatingId, pagination } = useSelector(
    (state: RootState) => state.bookings,
  );
  const [page, setPage]               = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchBookings({ page, limit: 20, status: statusFilter || undefined }) as any);
  }, [dispatch, page, statusFilter]);

  const handleUpdateStatus = async (id: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    try {
      await dispatch(updateBookingStatus({ id, status }) as any).unwrap();
    } catch { /* handled */ }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  const pendingCount   = bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Bookings</h1>
        <p className="mt-0.5 text-sm text-[var(--text-soft)]">
          Review and manage trip assignments for your fleet
        </p>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total',     value: pagination.total },
          { label: 'Pending',   value: pendingCount,   highlight: true },
          { label: 'Confirmed', value: confirmedCount },
          { label: 'Completed', value: completedCount },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">{s.label}</div>
            <div className={`mt-1 text-lg font-semibold tabular-nums ${(s as any).highlight ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tab filters */}
      <div className="flex flex-wrap gap-1.5">
        {(['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((val) => (
          <button
            key={val || 'ALL'}
            type="button"
            onClick={() => { setPage(1); setStatusFilter(val); }}
            className={`h-8 rounded-lg px-3.5 text-xs font-semibold transition-colors ${
              statusFilter === val
                ? 'bg-[var(--primary)] text-white'
                : 'border border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {val || 'All'}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {/* Content */}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => {
            const actions =
              booking.status === 'PENDING'
                ? [
                    { label: 'Confirm',  status: 'CONFIRMED'  as const },
                    { label: 'Cancel',   status: 'CANCELLED'  as const, danger: true },
                  ]
                : booking.status === 'CONFIRMED'
                  ? [
                      { label: 'Complete', status: 'COMPLETED' as const },
                      { label: 'Cancel',   status: 'CANCELLED' as const, danger: true },
                    ]
                  : [];

            return (
              <div key={booking.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--text)] truncate">
                      {booking.destination || 'Trip booking'}
                    </div>
                    <div className="text-xs text-[var(--text-soft)] mt-0.5">
                      #{formatShortId(booking.id)}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClass(booking.status)}`}>
                    {formatStatusLabel(booking.status)}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--border)] px-5 py-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Traveler</div>
                    <div className="text-xs font-medium text-[var(--text)] mt-0.5">{booking.userName || 'Guest'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Amount</div>
                    <div className="text-xs font-medium text-[var(--text)] mt-0.5">{formatCurrency(booking.totalAmount)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Dates</div>
                    <div className="text-xs font-medium text-[var(--text)] mt-0.5">{formatDateRange(booking.startDate, booking.endDate)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Driver</div>
                    <div className="text-xs font-medium text-[var(--text)] mt-0.5">
                      {booking.assignedDriver?.name || booking.driverNameSnapshot || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Vehicle</div>
                    <div className="text-xs font-medium text-[var(--text)] mt-0.5">
                      {booking.vehicleNumberSnapshot || '—'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {actions.length > 0 && (
                  <div className="flex gap-2 border-t border-[var(--border)] px-5 py-3 mt-auto">
                    {actions.map((action) => (
                      <button
                        key={action.status}
                        type="button"
                        disabled={updatingId === booking.id}
                        onClick={() => handleUpdateStatus(booking.id, action.status)}
                        className={`flex-1 h-8 rounded-lg border border-[var(--border)] text-xs font-medium transition-colors disabled:opacity-50 ${
                          action.danger
                            ? 'text-[var(--danger-text)] hover:bg-[var(--danger-bg)]'
                            : 'text-[var(--primary)] hover:bg-[var(--primary-soft)]'
                        }`}
                      >
                        {updatingId === booking.id ? '…' : action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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
