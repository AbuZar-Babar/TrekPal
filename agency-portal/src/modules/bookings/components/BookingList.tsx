import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../store';
import {
  formatCurrency,
  formatDate,
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

  const stats = [
    { label: 'Pending', value: bookings.filter((booking) => booking.status === 'PENDING').length },
    { label: 'Confirmed', value: bookings.filter((booking) => booking.status === 'CONFIRMED').length },
    { label: 'Completed', value: bookings.filter((booking) => booking.status === 'COMPLETED').length },
    { label: 'Cancelled', value: bookings.filter((booking) => booking.status === 'CANCELLED').length },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="app-card px-6 py-6 md:px-8 md:py-8">
          <div className="app-section-label">Accepted bookings</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Operational follow-through after traveler acceptance</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            Once a traveler accepts your offer, the booking flows into this queue for confirmation, servicing, completion, or cancellation.
          </p>
        </div>

        <div className="app-panel-dark px-6 py-6">
          <div className="app-section-label text-white/55">Lifecycle status</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Booking pulse</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">{stat.label}</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status || 'ALL'}
            type="button"
            onClick={() => {
              setPage(1);
              setStatusFilter(status);
            }}
            className={`${statusFilter === status ? 'app-btn-primary' : 'app-btn-secondary'} h-11 px-4 text-sm`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="app-table-shell px-6 py-14 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="app-table-shell px-6 py-14 text-center">
          <div className="text-lg font-semibold tracking-tight text-[var(--text)]">No bookings in this queue</div>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            Accepted traveler offers will automatically appear here for agency follow-up.
          </p>
        </div>
      ) : (
        <div className="app-table-shell overflow-x-auto">
          <table className="app-table min-w-[1120px]">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Traveler</th>
                <th>Travel window</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const actions =
                  booking.status === 'PENDING'
                    ? [
                        { label: 'Confirm', status: 'CONFIRMED' as const, classes: 'app-btn-primary' },
                        { label: 'Cancel', status: 'CANCELLED' as const, classes: 'app-btn-secondary' },
                      ]
                    : booking.status === 'CONFIRMED'
                      ? [
                          { label: 'Complete', status: 'COMPLETED' as const, classes: 'app-btn-primary' },
                          { label: 'Cancel', status: 'CANCELLED' as const, classes: 'app-btn-secondary' },
                        ]
                      : [];

                return (
                  <tr key={booking.id}>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">{booking.destination || 'Trip booking'}</div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">ID {formatShortId(booking.id)}</div>
                    </td>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">{booking.userName || 'Traveler'}</div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">Created {formatDate(booking.createdAt)}</div>
                    </td>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">{formatDateRange(booking.startDate, booking.endDate)}</div>
                    </td>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">{formatCurrency(booking.totalAmount)}</div>
                      {booking.bidId && <div className="mt-1 text-sm text-[var(--text-muted)]">Bid {formatShortId(booking.bidId)}</div>}
                    </td>
                    <td>
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
                    </td>
                    <td>
                      {actions.length === 0 ? (
                        <span className="text-sm text-[var(--text-muted)]">No further action</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {actions.map((action) => (
                            <button
                              key={action.status}
                              type="button"
                              disabled={updatingId === booking.id}
                              onClick={() => handleUpdateStatus(booking.id, action.status)}
                              className={`${action.classes} h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              {updatingId === booking.id ? 'Updating...' : action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page === 1}
            className="app-btn-secondary h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-[var(--text-muted)]">
            Page {page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page >= Math.ceil(pagination.total / pagination.limit)}
            className="app-btn-secondary h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingList;
