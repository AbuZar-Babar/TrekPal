import { Booking } from '../../../shared/types';

interface BookingCardProps {
  booking: Booking;
  isUpdating: boolean;
  onUpdateStatus: (bookingId: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => void;
}

const statusClasses: Record<Booking['status'], string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const BookingCard = ({ booking, isUpdating, onUpdateStatus }: BookingCardProps) => {
  const actions =
    booking.status === 'PENDING'
      ? [
          { label: 'Confirm', status: 'CONFIRMED' as const, classes: 'bg-emerald-600 text-white hover:bg-emerald-700' },
          { label: 'Cancel', status: 'CANCELLED' as const, classes: 'bg-red-50 text-red-700 hover:bg-red-100' },
        ]
      : booking.status === 'CONFIRMED'
        ? [
            { label: 'Complete', status: 'COMPLETED' as const, classes: 'bg-indigo-600 text-white hover:bg-indigo-700' },
            { label: 'Cancel', status: 'CANCELLED' as const, classes: 'bg-red-50 text-red-700 hover:bg-red-100' },
          ]
        : [];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">{booking.destination || 'Trip Booking'}</h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[booking.status]}`}>
                {booking.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Traveler: {booking.userName || 'Traveler'} | Booking ID: {booking.id.slice(0, 8)}
            </p>
          </div>

          <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Travel Window</div>
              <div className="mt-1 font-semibold text-gray-900">
                {new Date(booking.startDate).toLocaleDateString()} -{' '}
                {new Date(booking.endDate).toLocaleDateString()}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Amount</div>
              <div className="mt-1 font-semibold text-gray-900">
                PKR {booking.totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Created</div>
              <div className="mt-1 font-semibold text-gray-900">
                {new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Bid Reference</div>
              <div className="mt-1 font-semibold text-gray-900">
                {booking.bidId ? booking.bidId.slice(0, 8) : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-[240px] rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Booking Actions</div>
          <div className="mt-2 text-sm text-gray-500">
            Confirm accepted bookings, close completed trips, or cancel when plans change.
          </div>
          <div className="mt-5 space-y-2">
            {actions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500">
                No further actions available for this booking.
              </div>
            ) : (
              actions.map((action) => (
                <button
                  key={action.status}
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(booking.id, action.status)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${action.classes} disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {isUpdating ? 'Updating...' : action.label}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
