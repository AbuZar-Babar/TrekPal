import { Vehicle } from '../../../shared/types';
import { PortalListItemTransition } from '../../../shared/components/motion/portalMotion';
import PatternCardChrome from '../../../shared/components/UI/PatternCardChrome';

interface VehicleCardProps {
  vehicle: Vehicle;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const VehicleCard = ({ vehicle, onApprove, onReject }: VehicleCardProps) => {
  const isPending = vehicle.status === 'PENDING';

  const statusBadge = {
    PENDING: 'bg-[var(--warning-bg)] text-[var(--warning-text)] border border-white/10',
    APPROVED: 'bg-[var(--success-bg)] text-[var(--success-text)] border border-white/10',
    REJECTED: 'bg-[var(--danger-bg)] text-[var(--danger-text)] border border-white/10',
  }[vehicle.status] || 'bg-[var(--neutral-bg)] text-[var(--neutral-text)]';

  return (
    <PortalListItemTransition className="sovereign-pattern-card p-5">
      <PatternCardChrome />
      <div className="sovereign-pattern-card-content flex justify-between items-start">
        <div className="flex gap-4 flex-1">
          <span className="sovereign-pattern-icon flex-shrink-0">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 13l2-6h14l2 6M5 13v5h2m10-5v5h2M7 18a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </span>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <h3 className="text-base font-bold text-[var(--text)] truncate">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge}`}>
                {vehicle.status}
              </span>
            </div>

            {/* Provider */}
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mb-3">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
              <span>{vehicle.vehicleProviderName}</span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="flex items-center gap-2 rounded-[12px] bg-[var(--surface-low)] px-3 py-2">
                <svg className="w-4 h-4 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div>
                  <p className="text-[10px] text-[var(--text-soft)] font-medium">Type</p>
                  <p className="text-xs font-semibold text-[var(--text)]">{vehicle.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-[12px] bg-[var(--surface-low)] px-3 py-2">
                <svg className="w-4 h-4 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div>
                  <p className="text-[10px] text-[var(--text-soft)] font-medium">Seats</p>
                  <p className="text-xs font-semibold text-[var(--text)]">{vehicle.capacity}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-[12px] bg-[var(--surface-low)] px-3 py-2">
                <svg className="w-4 h-4 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[10px] text-[var(--text-soft)] font-medium">Price/Day</p>
                  <p className="text-xs font-semibold text-[var(--text)]">PKR {vehicle.pricePerDay.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-[12px] bg-[var(--surface-low)] px-3 py-2">
                <svg className="w-4 h-4 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[10px] text-[var(--text-soft)] font-medium">Available</p>
                  <p className={`text-xs font-semibold ${vehicle.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                    {vehicle.isAvailable ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Image */}
            {vehicle.images && vehicle.images.length > 0 && (
              <div className="mb-3">
                <img
                  src={vehicle.images[0]}
                  alt={vehicle.make}
                  className="h-40 w-full rounded-[14px] border border-[var(--border)] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
          {(isPending || vehicle.status === 'REJECTED') && (
            <button
              onClick={() => onApprove(vehicle.id)}
              className="inline-flex items-center gap-1.5 rounded-[14px] bg-gradient-to-r from-green-500 to-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 hover:from-green-600 hover:to-emerald-700"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
          )}
          {(isPending || vehicle.status === 'APPROVED') && (
            <button
              onClick={() => onReject(vehicle.id)}
              className="inline-flex items-center gap-1.5 rounded-[14px] bg-gradient-to-r from-red-500 to-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 hover:from-red-600 hover:to-rose-700"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          )}
        </div>
      </div>
    </PortalListItemTransition>
  );
};

export default VehicleCard;
