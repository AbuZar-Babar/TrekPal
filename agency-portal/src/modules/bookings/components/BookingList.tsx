import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import BookingCard from './BookingCard';
import { fetchBookings, updateBookingStatus } from '../store/bookingsSlice';

const BookingList = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error, updatingId, pagination } = useSelector(
    (state: RootState) => state.bookings
  );
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(
      fetchBookings({
        page,
        limit: 20,
        status: statusFilter || undefined,
      }) as any
    );
  }, [dispatch, page, statusFilter]);

  const handleUpdateStatus = async (
    bookingId: string,
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  ) => {
    try {
      await dispatch(updateBookingStatus({ id: bookingId, status }) as any).unwrap();
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accepted Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage booking lifecycle after your bid is selected by a traveler.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status || 'ALL'}
              type="button"
              onClick={() => {
                setPage(1);
                setStatusFilter(status);
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {status || 'ALL'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
          <p className="mt-4 text-sm text-gray-500">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
            <svg className="h-8 w-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">No bookings yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Accepted traveler bids will automatically appear here for follow-up.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isUpdating={updatingId === booking.id}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page === 1}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-600">
            Page {page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page >= Math.ceil(pagination.total / pagination.limit)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingList;
