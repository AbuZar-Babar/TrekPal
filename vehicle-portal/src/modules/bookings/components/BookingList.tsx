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

const BookingList = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error, updatingId, pagination } = useSelector(
    (state: RootState) => state.bookings,
  );
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(
      fetchBookings({
        page,
        limit: 20,
        status: statusFilter || undefined,
      }) as any,
    );
  }, [dispatch, page, statusFilter]);

  const handleUpdateStatus = async (
    bookingId: string,
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ) => {
    try {
      await dispatch(updateBookingStatus({ id: bookingId, status }) as any).unwrap();
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-6">
      <section className="section-title-row">
        <h2 className="section-title">Bookings</h2>
      </section>

      <div className="segmented-filters">
        {['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status || 'ALL'}
            type="button"
            onClick={() => {
              setPage(1);
              setStatusFilter(status);
            }}
            className={`${statusFilter === status ? 'app-btn-primary' : 'app-btn-secondary'} app-btn-md`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="surface py-20 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="surface py-20 text-center">
          <p className="text-[var(--text-soft)]">No bookings found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => {
            const actions =
              booking.status === 'PENDING'
                ? [
                    { label: 'Confirm', status: 'CONFIRMED' as const, classes: 'text-[var(--primary)] hover:bg-[var(--primary-subtle)]' },
                    { label: 'Cancel', status: 'CANCELLED' as const, classes: 'text-[var(--danger-text)] hover:bg-[var(--danger-bg)]' },
                  ]
                : booking.status === 'CONFIRMED'
                  ? [
                      { label: 'Complete', status: 'COMPLETED' as const, classes: 'text-[var(--primary)] hover:bg-[var(--primary-subtle)]' },
                      { label: 'Cancel', status: 'CANCELLED' as const, classes: 'text-[var(--danger-text)] hover:bg-[var(--danger-bg)]' },
                    ]
                  : [];

            return (
              <article key={booking.id} className="surface flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text)]">
                      {booking.destination || 'Trip booking'}
                    </h3>
                    <p className="text-sm text-[var(--text-soft)]">ID {formatShortId(booking.id)}</p>
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
                    {formatStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Traveler</div>
                    <div className="text-sm font-medium text-[var(--text)]">{booking.userName || 'Guest'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Amount</div>
                    <div className="text-sm font-medium text-[var(--text)]">{formatCurrency(booking.totalAmount)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Dates</div>
                    <div className="text-sm font-medium text-[var(--text)]">{formatDateRange(booking.startDate, booking.endDate)}</div>
                  </div>
                </div>

                {actions.length > 0 && (
                  <div className="mt-6 flex gap-2 border-t border-[var(--border)] pt-4">
                    {actions.map((action) => (
                      <button
                        key={action.status}
                        type="button"
                        disabled={updatingId === booking.id}
                        onClick={() => handleUpdateStatus(booking.id, action.status)}
                        className={`app-btn-secondary app-btn-sm flex-1 ${action.classes} disabled:opacity-50`}
                      >
                        {updatingId === booking.id ? '...' : action.label}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="app-btn-secondary h-10 px-4 text-xs disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-medium text-[var(--text-soft)]">
            Page {page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(pagination.total / pagination.limit)}
            className="app-btn-secondary h-10 px-4 text-xs disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingList;
