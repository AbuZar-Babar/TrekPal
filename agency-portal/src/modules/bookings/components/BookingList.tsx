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
      <section className="page-hero">
        <div>
          <div className="page-eyebrow">Bookings</div>
          <h1 className="page-title">Booking operations are clearer, faster, and less table-bound.</h1>
          <p className="page-copy">
            Confirm traveler requests, finish completed work, and review queue health from a cleaner booking surface that now works on mobile as well.
          </p>
        </div>
        <div className="page-stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-note">Current booking state count</div>
            </div>
          ))}
        </div>
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
            className={`${statusFilter === status ? 'app-btn-primary' : 'app-btn-secondary'} h-11 px-4 text-sm`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-[18px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="surface loading-state">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="surface empty-state">
          <div className="empty-state-title">No bookings in this queue</div>
          <div className="empty-state-copy">New traveler booking requests will appear here for agency follow-up.</div>
        </div>
      ) : (
        <>
          <div className="mobile-record-list lg:hidden">
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
                <div key={booking.id} className="record-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="record-title">{booking.destination || 'Trip booking'}</div>
                      <div className="record-copy">{booking.userName || 'Traveler'} · ID {formatShortId(booking.id)}</div>
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

                  <div className="record-grid">
                    <div className="record-meta-block">
                      <div className="record-meta-label">Window</div>
                      <div className="record-meta-value">{formatDateRange(booking.startDate, booking.endDate)}</div>
                    </div>
                    <div className="record-meta-block">
                      <div className="record-meta-label">Amount</div>
                      <div className="record-meta-value">{formatCurrency(booking.totalAmount)}</div>
                    </div>
                    <div className="record-meta-block">
                      <div className="record-meta-label">Created</div>
                      <div className="record-meta-value">{formatDate(booking.createdAt)}</div>
                    </div>
                    <div className="record-meta-block">
                      <div className="record-meta-label">Bid</div>
                      <div className="record-meta-value">{booking.bidId ? formatShortId(booking.bidId) : '--'}</div>
                    </div>
                  </div>

                  <div className="record-actions">
                    {actions.length === 0 ? (
                      <span className="text-sm text-[var(--text-muted)]">No further action</span>
                    ) : (
                      actions.map((action) => (
                        <button
                          key={action.status}
                          type="button"
                          disabled={updatingId === booking.id}
                          onClick={() => handleUpdateStatus(booking.id, action.status)}
                          className={`${action.classes} h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {updatingId === booking.id ? 'Updating...' : action.label}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="app-table-shell hidden overflow-x-auto lg:block">
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
        </>
      )}

      {pagination.total > pagination.limit && (
        <div className="page-pagination">
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
