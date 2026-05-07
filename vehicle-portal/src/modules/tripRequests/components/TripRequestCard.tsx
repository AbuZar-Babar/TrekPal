import { Bid, TripRequest } from '../../../shared/types';

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
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">{tripRequest.destination}</h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                {tripRequest.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Requested by {tripRequest.userName || 'Traveler'} on{' '}
              {new Date(tripRequest.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Travel Dates</div>
              <div className="mt-1 font-semibold text-gray-900">
                {new Date(tripRequest.startDate).toLocaleDateString()} -{' '}
                {new Date(tripRequest.endDate).toLocaleDateString()}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Travelers</div>
              <div className="mt-1 font-semibold text-gray-900">{tripRequest.travelers}</div>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Budget</div>
              <div className="mt-1 font-semibold text-gray-900">
                {tripRequest.budget ? `PKR ${tripRequest.budget.toLocaleString()}` : 'Flexible'}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Competition</div>
              <div className="mt-1 font-semibold text-gray-900">{tripRequest.bidsCount} bids</div>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Stay</div>
              <div className="mt-1 font-semibold text-gray-900">
                {prettyLabel(tripRequest.tripSpecs.stayType)}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Rooms</div>
              <div className="mt-1 font-semibold text-gray-900">
                {tripRequest.tripSpecs.roomCount} x {prettyLabel(tripRequest.tripSpecs.roomPreference)}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Transport</div>
              <div className="mt-1 font-semibold text-gray-900">
                {tripRequest.tripSpecs.transportRequired
                  ? prettyLabel(tripRequest.tripSpecs.transportType)
                  : 'Not required'}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Meals</div>
              <div className="mt-1 font-semibold text-gray-900">
                {prettyLabel(tripRequest.tripSpecs.mealPlan)}
              </div>
            </div>
          </div>

          {(tripRequest.description || tripRequest.tripSpecs.specialRequirements) && (
            <div className="grid gap-3 lg:grid-cols-2">
              {tripRequest.description && (
                <p className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
                  {tripRequest.description}
                </p>
              )}
              {tripRequest.tripSpecs.specialRequirements && (
                <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  <span className="font-semibold">Special requirements:</span>{' '}
                  {tripRequest.tripSpecs.specialRequirements}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="min-w-[290px] rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">Your Position</div>
              <div className="mt-1 text-lg font-bold text-gray-900">
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
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                  {existingBid.offerDetails.stayIncluded ? 'Stay included' : 'No stay'}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                  {existingBid.offerDetails.transportIncluded ? 'Transport included' : 'No transport'}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                  {existingBid.offerDetails.mealsIncluded ? 'Meals included' : 'No meals'}
                </span>
              </>
            ) : (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                Build a structured quote
              </span>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            {existingBid
              ? existingBid.awaitingActionBy === 'AGENCY' && existingBid.status === 'PENDING'
                ? 'The traveler has responded. Revise the quote or scope to keep the negotiation moving.'
                : existingBid.description || 'Your current offer is on this negotiation thread.'
              : 'Package the stay, transport, meals, and extras into one clear commercial offer.'}
          </div>

          <button
            type="button"
            onClick={() => onOpenOffer(tripRequest)}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripRequestCard;
