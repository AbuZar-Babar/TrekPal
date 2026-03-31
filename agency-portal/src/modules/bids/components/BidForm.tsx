import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Bid, OfferDetails, TripRequest } from '../../../shared/types';

interface BidFormProps {
  tripRequest: TripRequest;
  loading: boolean;
  existingBid?: Bid;
  onCancel: () => void;
  onSubmit: (payload: {
    price: number;
    description?: string;
    offerDetails: OfferDetails;
  }) => Promise<void>;
}

const prettyLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const BidForm = ({
  tripRequest,
  loading,
  existingBid,
  onCancel,
  onSubmit,
}: BidFormProps) => {
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stayIncluded, setStayIncluded] = useState(false);
  const [stayDetails, setStayDetails] = useState('');
  const [transportIncluded, setTransportIncluded] = useState(false);
  const [transportDetails, setTransportDetails] = useState('');
  const [mealsIncluded, setMealsIncluded] = useState(false);
  const [mealDetails, setMealDetails] = useState('');
  const [extras, setExtras] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!existingBid) {
      setPrice('');
      setDescription('');
      setStayIncluded(false);
      setStayDetails('');
      setTransportIncluded(false);
      setTransportDetails('');
      setMealsIncluded(false);
      setMealDetails('');
      setExtras('');
      return;
    }

    setPrice(existingBid.price.toString());
    setDescription(existingBid.description || '');
    setStayIncluded(existingBid.offerDetails.stayIncluded);
    setStayDetails(existingBid.offerDetails.stayDetails);
    setTransportIncluded(existingBid.offerDetails.transportIncluded);
    setTransportDetails(existingBid.offerDetails.transportDetails);
    setMealsIncluded(existingBid.offerDetails.mealsIncluded);
    setMealDetails(existingBid.offerDetails.mealDetails);
    setExtras(existingBid.offerDetails.extras);
  }, [existingBid]);

  const isReadOnly = Boolean(
    existingBid &&
      (existingBid.status !== 'PENDING' || existingBid.awaitingActionBy !== 'AGENCY'),
  );

  const heading = existingBid ? 'Offer Thread' : 'Submit Structured Offer';
  const submitLabel = existingBid ? 'Send Revision' : 'Submit Offer';

  const statusMessage = useMemo(() => {
    if (!existingBid) {
      return null;
    }

    if (existingBid.status === 'ACCEPTED') {
      return 'This offer has been accepted and turned into a booking.';
    }

    if (existingBid.status === 'REJECTED') {
      return 'This negotiation thread is closed because another offer was chosen.';
    }

    if (existingBid.awaitingActionBy === 'AGENCY') {
      return 'The traveler has responded. You can revise the price or inclusions now.';
    }

    return 'The traveler is reviewing your latest offer.';
  }, [existingBid]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isReadOnly) {
      onCancel();
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError('Enter a valid offer amount.');
      return;
    }

    setError(null);
    await onSubmit({
      price: numericPrice,
      description: description.trim() || undefined,
      offerDetails: {
        stayIncluded,
        stayDetails: stayDetails.trim(),
        transportIncluded,
        transportDetails: transportDetails.trim(),
        mealsIncluded,
        mealDetails: mealDetails.trim(),
        extras: extras.trim(),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{heading}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {tripRequest.destination} from{' '}
              {new Date(tripRequest.startDate).toLocaleDateString()} to{' '}
              {new Date(tripRequest.endDate).toLocaleDateString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(92vh-86px)] overflow-y-auto px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-5">
              <div className="grid gap-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">Travelers</div>
                  <div className="mt-1 font-semibold text-gray-900">{tripRequest.travelers}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">Budget</div>
                  <div className="mt-1 font-semibold text-gray-900">
                    {tripRequest.budget ? `PKR ${tripRequest.budget.toLocaleString()}` : 'Open'}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">Stay</div>
                  <div className="mt-1 font-semibold text-gray-900">
                    {prettyLabel(tripRequest.tripSpecs.stayType)}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">Transport</div>
                  <div className="mt-1 font-semibold text-gray-900">
                    {tripRequest.tripSpecs.transportRequired
                      ? prettyLabel(tripRequest.tripSpecs.transportType)
                      : 'Not required'}
                  </div>
                </div>
              </div>

              {(tripRequest.description || tripRequest.tripSpecs.specialRequirements) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {tripRequest.description && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                      {tripRequest.description}
                    </div>
                  )}
                  {tripRequest.tripSpecs.specialRequirements && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      <span className="font-semibold">Special requirements:</span>{' '}
                      {tripRequest.tripSpecs.specialRequirements}
                    </div>
                  )}
                </div>
              )}

              {statusMessage && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {statusMessage}
                </div>
              )}

              <div>
                <label htmlFor="price" className="mb-2 block text-sm font-semibold text-gray-700">
                  Total Offer (PKR)
                </label>
                <input
                  id="price"
                  type="number"
                  min="1"
                  step="1"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  disabled={isReadOnly}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                  placeholder="Enter your total commercial offer"
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-semibold text-gray-700">
                  Negotiation Note
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  disabled={isReadOnly}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                  placeholder="Summarize the commercial logic, itinerary scope, or changes you are proposing."
                />
              </div>

              <div className="grid gap-4">
                <StructuredToggle
                  checked={stayIncluded}
                  title="Stay included"
                  disabled={isReadOnly}
                  onChange={setStayIncluded}
                />
                <textarea
                  value={stayDetails}
                  onChange={(event) => setStayDetails(event.target.value)}
                  rows={2}
                  disabled={isReadOnly}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                  placeholder="Hotel/resort class, room arrangement, area, or property notes."
                />

                <StructuredToggle
                  checked={transportIncluded}
                  title="Transport included"
                  disabled={isReadOnly}
                  onChange={setTransportIncluded}
                />
                <textarea
                  value={transportDetails}
                  onChange={(event) => setTransportDetails(event.target.value)}
                  rows={2}
                  disabled={isReadOnly}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                  placeholder="Vehicle type, pickup model, intercity transfers, driver availability."
                />

                <StructuredToggle
                  checked={mealsIncluded}
                  title="Meals included"
                  disabled={isReadOnly}
                  onChange={setMealsIncluded}
                />
                <textarea
                  value={mealDetails}
                  onChange={(event) => setMealDetails(event.target.value)}
                  rows={2}
                  disabled={isReadOnly}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                  placeholder="Breakfast, half-board, full-board, meal quality, dietary coverage."
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Extras</label>
                  <textarea
                    value={extras}
                    onChange={(event) => setExtras(event.target.value)}
                    rows={2}
                    disabled={isReadOnly}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                    placeholder="Sightseeing, welcome kit, guide, flexible timing, or other differentiators."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div className="text-xs uppercase tracking-wide text-gray-400">Commercial brief</div>
                <div className="mt-3 space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between gap-4">
                    <span>Room preference</span>
                    <span className="font-semibold text-gray-900">
                      {tripRequest.tripSpecs.roomCount} x {prettyLabel(tripRequest.tripSpecs.roomPreference)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Meal plan</span>
                    <span className="font-semibold text-gray-900">
                      {prettyLabel(tripRequest.tripSpecs.mealPlan)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Offer threads</span>
                    <span className="font-semibold text-gray-900">{tripRequest.bidsCount}</span>
                  </div>
                  {existingBid && (
                    <>
                      <div className="flex justify-between gap-4">
                        <span>Revision count</span>
                        <span className="font-semibold text-gray-900">{existingBid.revisionCount}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Next move</span>
                        <span className="font-semibold text-gray-900">
                          {existingBid.awaitingActionBy === 'AGENCY' ? 'Agency' : existingBid.awaitingActionBy === 'TRAVELER' ? 'Traveler' : 'Closed'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {existingBid?.revisions && existingBid.revisions.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="text-sm font-semibold text-gray-900">Negotiation History</div>
                  <div className="mt-4 space-y-3">
                    {existingBid.revisions.map((revision) => (
                      <div
                        key={revision.id}
                        className={`rounded-xl border px-4 py-3 text-sm ${
                          revision.actorRole === 'AGENCY'
                            ? 'border-indigo-100 bg-indigo-50 text-indigo-900'
                            : 'border-amber-100 bg-amber-50 text-amber-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-semibold">
                            {revision.actorRole === 'AGENCY' ? 'Agency update' : 'Traveler counteroffer'}
                          </span>
                          <span>{new Date(revision.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="mt-2 font-bold">PKR {revision.price.toLocaleString()}</div>
                        {revision.description && <div className="mt-2">{revision.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Saving...' : submitLabel}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const StructuredToggle = ({
  checked,
  title,
  disabled,
  onChange,
}: {
  checked: boolean;
  title: string;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) => {
  return (
    <label className={`flex items-center justify-between rounded-xl border px-4 py-3 ${disabled ? 'bg-gray-100' : 'bg-white'} border-gray-200`}>
      <span className="text-sm font-semibold text-gray-700">{title}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
    </label>
  );
};

export default BidForm;
