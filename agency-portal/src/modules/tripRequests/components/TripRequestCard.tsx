import { Bid, TripRequest } from '../../../shared/types';
import { PortalListItemTransition } from '../../../shared/components/motion/portalMotion';

interface TripRequestCardProps {
  tripRequest: TripRequest;
  existingBid?: Bid;
  onOpenOffer: (tripRequest: TripRequest) => void;
}

const prettyLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const TripRequestCard = ({
  tripRequest,
  existingBid,
  onOpenOffer,
}: TripRequestCardProps) => {
  const bidStatusClasses = existingBid
    ? existingBid.status === 'ACCEPTED'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : existingBid.status === 'REJECTED'
        ? 'bg-red-50 text-red-700 border-red-200'
        : existingBid.awaitingActionBy === 'AGENCY'
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const actionLabel = !existingBid
    ? 'Submit structured offer'
    : existingBid.status !== 'PENDING'
      ? 'Review thread'
      : existingBid.awaitingActionBy === 'AGENCY'
        ? 'Revise offer'
        : 'View thread';

  return (
    <PortalListItemTransition className="portal-pattern-card rounded-[18px] border border-[var(--border)] bg-[var(--panel)] p-6 hover:-translate-y-1">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-[var(--text)]">{tripRequest.destination}</h3>
              <span className="rounded-full bg-[var(--panel-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {tripRequest.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Requested by {tripRequest.userName || 'Traveler'} on{' '}
              {new Date(tripRequest.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="grid gap-3 text-sm text-[var(--text-muted)] sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[14px] bg-[var(--panel-subtle)] px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Travel Dates</div>
              <div className="mt-1 font-semibold text-[var(--text)]">
                {new Date(tripRequest.startDate).toLocaleDateString()} -{' '}
                {new Date(tripRequest.endDate).toLocaleDateString()}
              </div>
            </div>
            <div className="rounded-[14px] bg-[var(--panel-subtle)] px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Travelers</div>
              <div className="mt-1 font-semibold text-[var(--text)]">{tripRequest.travelers}</div>
            </div>
            <div className="rounded-[14px] bg-[var(--panel-subtle)] px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Budget</div>
              <div className="mt-1 font-semibold text-[var(--text)]">
                {tripRequest.budget ? `PKR ${tripRequest.budget.toLocaleString()}` : 'Flexible'}
              </div>
            </div>
            <div className="rounded-[14px] bg-[var(--panel-subtle)] px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Competition</div>
              <div className="mt-1 font-semibold text-[var(--text)]">{tripRequest.bidsCount} bids</div>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-[var(--text-muted)] sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Stay</div>
              <div className="mt-1 font-semibold text-[var(--text)]">
                {prettyLabel(tripRequest.tripSpecs.stayType)}
              </div>
            </div>
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Rooms</div>
              <div className="mt-1 font-semibold text-[var(--text)]">
                {tripRequest.tripSpecs.roomCount} x {prettyLabel(tripRequest.tripSpecs.roomPreference)}
              </div>
            </div>
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Transport</div>
              <div className="mt-1 font-semibold text-[var(--text)]">
                {tripRequest.tripSpecs.transportRequired
                  ? prettyLabel(tripRequest.tripSpecs.transportType)
                  : 'Not required'}
              </div>
            </div>
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Meals</div>
              <div className="mt-1 font-semibold text-[var(--text)]">
                {prettyLabel(tripRequest.tripSpecs.mealPlan)}
              </div>
            </div>
          </div>

          {(tripRequest.description || tripRequest.tripSpecs.specialRequirements) && (
            <div className="grid gap-3 lg:grid-cols-2">
              {tripRequest.description && (
                <p className="rounded-[14px] border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-3 text-sm leading-6 text-[var(--text-muted)]">
                  {tripRequest.description}
                </p>
              )}
              {tripRequest.tripSpecs.specialRequirements && (
                <p className="rounded-[14px] border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  <span className="font-semibold">Special requirements:</span>{' '}
                  {tripRequest.tripSpecs.specialRequirements}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="min-w-[290px] rounded-[18px] border border-[var(--border)] bg-[var(--panel-subtle)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Your Position</div>
              <div className="mt-1 text-lg font-bold text-[var(--text)]">
                {existingBid ? `PKR ${existingBid.price.toLocaleString()}` : 'No offer yet'}
              </div>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${bidStatusClasses}`}>
              {existingBid
                ? existingBid.status === 'PENDING'
                  ? existingBid.awaitingActionBy === 'AGENCY'
                    ? 'YOUR MOVE'
                    : 'TRAVELER REVIEW'
                  : existingBid.status
                : 'OPEN'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {existingBid ? (
              <>
                <span className="rounded-full bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                  {existingBid.offerDetails.stayIncluded ? 'Stay included' : 'No stay'}
                </span>
                <span className="rounded-full bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                  {existingBid.offerDetails.transportIncluded ? 'Transport included' : 'No transport'}
                </span>
                <span className="rounded-full bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                  {existingBid.offerDetails.mealsIncluded ? 'Meals included' : 'No meals'}
                </span>
              </>
            ) : (
              <span className="rounded-full bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                Build a structured quote
              </span>
            )}
          </div>

          <div className="mt-4 text-sm text-[var(--text-muted)]">
            {existingBid
              ? existingBid.awaitingActionBy === 'AGENCY' && existingBid.status === 'PENDING'
                ? 'The traveler has responded. Revise the quote or scope to keep the negotiation moving.'
                : existingBid.description || 'Your current offer is on this negotiation thread.'
              : 'Package the stay, transport, meals, and extras into one clear commercial offer.'}
          </div>

          <button
            type="button"
            onClick={() => onOpenOffer(tripRequest)}
            className="app-btn-primary app-btn-md mt-5 w-full"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </PortalListItemTransition>
  );
};

export default TripRequestCard;
