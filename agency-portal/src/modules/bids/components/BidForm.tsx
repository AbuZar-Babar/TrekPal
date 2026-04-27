import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Bid, OfferDetails, TripRequest } from '../../../shared/types';
import {
  formatCurrency,
  formatDateRange,
  formatDateTime,
  formatStatusLabel,
} from '../../../shared/utils/formatters';

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

  const heading = existingBid ? 'Offer thread' : 'Create structured offer';
  const submitLabel = existingBid ? 'Send revision' : 'Submit offer';

  const statusMessage = useMemo(() => {
    if (!existingBid) {
      return 'Structure your price and inclusions clearly so the traveler can compare your offer against other agencies.';
    }

    if (existingBid.status === 'ACCEPTED') {
      return 'This offer has been accepted and converted into a booking.';
    }

    if (existingBid.status === 'REJECTED') {
      return 'This thread is closed because another agency offer was selected.';
    }

    if (existingBid.awaitingActionBy === 'AGENCY') {
      return 'The traveler has responded. You can revise the commercial scope and send a counteroffer now.';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-md">
      <div className="app-card max-h-[94vh] w-full max-w-6xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <div className="app-section-label">Negotiation thread</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text)]">{heading}</h2>
            <p className="mt-1 text-sm leading-7 text-[var(--text-muted)]">
              {tripRequest.destination} • {formatDateRange(tripRequest.startDate, tripRequest.endDate)}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="app-btn-secondary h-11 w-11 p-0"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(94vh-88px)] overflow-y-auto px-6 py-6">
          <div className="grid gap-6 xl:grid-cols-[1.18fr,0.82fr]">
            <div className="space-y-6">
              <div className="app-card-subtle px-5 py-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">Travelers</div>
                    <div className="mt-2 text-base font-semibold tracking-tight text-[var(--text)]">{tripRequest.travelers}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">Budget</div>
                    <div className="mt-2 text-base font-semibold tracking-tight text-[var(--text)]">{formatCurrency(tripRequest.budget)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">Stay type</div>
                    <div className="mt-2 text-base font-semibold tracking-tight text-[var(--text)]">{formatStatusLabel(tripRequest.tripSpecs.stayType)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">Meal plan</div>
                    <div className="mt-2 text-base font-semibold tracking-tight text-[var(--text)]">{formatStatusLabel(tripRequest.tripSpecs.mealPlan)}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] px-5 py-4 text-sm leading-7 text-[var(--text-muted)]">
                {statusMessage}
              </div>

              <div className="app-card-subtle px-5 py-5">
                <div className="app-section-label">Pricing</div>
                <div className="mt-4 grid gap-5">
                  <div>
                    <label htmlFor="price" className="mb-2 block text-sm font-semibold text-[var(--text)]">
                      Total offer (PKR)
                    </label>
                    <input
                      id="price"
                      type="number"
                      min="1"
                      step="1"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      disabled={isReadOnly}
                      className="app-field"
                      placeholder="Enter your total commercial offer"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="mb-2 block text-sm font-semibold text-[var(--text)]">
                      Negotiation note
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={4}
                      disabled={isReadOnly}
                      className="app-field min-h-[112px]"
                      placeholder="Summarize the commercial logic or scope adjustments you are proposing."
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <StructuredBlock
                  checked={stayIncluded}
                  title="Stay included"
                  description="Explain room arrangement, hotel tier, location, or property notes."
                  value={stayDetails}
                  disabled={isReadOnly}
                  onToggle={setStayIncluded}
                  onChange={setStayDetails}
                />
                <StructuredBlock
                  checked={transportIncluded}
                  title="Transport included"
                  description="Explain vehicle class, transfers, driver, and pickup scope."
                  value={transportDetails}
                  disabled={isReadOnly}
                  onToggle={setTransportIncluded}
                  onChange={setTransportDetails}
                />
                <StructuredBlock
                  checked={mealsIncluded}
                  title="Meals included"
                  description="Explain breakfast, half-board, full-board, or dietary coverage."
                  value={mealDetails}
                  disabled={isReadOnly}
                  onToggle={setMealsIncluded}
                  onChange={setMealDetails}
                />

                <div className="app-card-subtle px-5 py-5">
                  <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Extras</label>
                  <textarea
                    value={extras}
                    onChange={(event) => setExtras(event.target.value)}
                    rows={3}
                    disabled={isReadOnly}
                    className="app-field min-h-[96px]"
                    placeholder="Guides, sightseeing, flexible timing, welcome kits, or other differentiators."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="app-panel-dark px-5 py-5">
                <div className="app-section-label text-white/55">Commercial brief</div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-white/72">
                    <span>Travel window</span>
                    <span className="text-right font-semibold text-white">{formatDateRange(tripRequest.startDate, tripRequest.endDate)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-white/72">
                    <span>Rooms requested</span>
                    <span className="text-right font-semibold text-white">
                      {tripRequest.tripSpecs.roomCount} x {formatStatusLabel(tripRequest.tripSpecs.roomPreference)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-white/72">
                    <span>Transport</span>
                    <span className="text-right font-semibold text-white">
                      {tripRequest.tripSpecs.transportRequired ? formatStatusLabel(tripRequest.tripSpecs.transportType) : 'Not required'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-white/72">
                    <span>Bid competition</span>
                    <span className="text-right font-semibold text-white">{tripRequest.bidsCount} thread(s)</span>
                  </div>
                  {tripRequest.hotel && (
                    <div className="mt-4 border-t border-white/10 pt-4 space-y-3">
                      <div className="app-section-label text-white/40 text-[10px]">Hotel Base Pricing</div>
                      <div className="flex justify-between gap-4 text-white/72">
                        <span>Hotel</span>
                        <span className="text-right font-semibold text-white">{tripRequest.hotel.name}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-white/72">
                        <span>Room Type</span>
                        <span className="text-right font-semibold text-white">{tripRequest.room?.type || 'Standard'}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-white/72">
                        <span>Base Price/Night</span>
                        <span className="text-right font-semibold text-white">{formatCurrency(tripRequest.room?.price || 0)}</span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1 text-white/90 border-t border-white/5">
                        <span>Total Hotel Cost</span>
                        <span className="text-right font-bold text-[var(--primary)]">
                          {formatCurrency(
                            (tripRequest.room?.price || 0) * 
                            (tripRequest.tripSpecs.roomCount || 1) * 
                            Math.max(1, Math.ceil((new Date(tripRequest.endDate).getTime() - new Date(tripRequest.startDate).getTime()) / (1000 * 60 * 60 * 24)))
                          )}
                        </span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-white/40 italic">
                        * This is the hotel's direct rate. Add your agency service fee on top when submitting your offer.
                      </p>
                    </div>
                  )}
                  {existingBid && (
                    <>
                      <div className="flex justify-between gap-4 text-white/72">
                        <span>Current status</span>
                        <span className="text-right font-semibold text-white">
                          {existingBid.status === 'PENDING'
                            ? existingBid.awaitingActionBy === 'AGENCY'
                              ? 'Agency turn'
                              : 'Traveler review'
                            : formatStatusLabel(existingBid.status)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-white/72">
                        <span>Revision count</span>
                        <span className="text-right font-semibold text-white">{existingBid.revisionCount}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {existingBid?.revisions && existingBid.revisions.length > 0 && (
                <div className="app-card px-5 py-5">
                  <div className="app-section-label">History</div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text)]">Negotiation revisions</h3>
                  <div className="mt-4 space-y-3">
                    {existingBid.revisions.map((revision) => (
                      <div
                        key={revision.id}
                        className={`rounded-[20px] border px-4 py-4 text-sm ${
                          revision.actorRole === 'AGENCY'
                            ? 'border-[var(--border)] bg-[var(--panel-subtle)]'
                            : 'border-[var(--warning-bg)] bg-[var(--warning-bg)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-semibold text-[var(--text)]">
                            {revision.actorRole === 'AGENCY' ? 'Agency update' : 'Traveler counteroffer'}
                          </span>
                          <span className="text-[var(--text-soft)]">{formatDateTime(revision.createdAt)}</span>
                        </div>
                        <div className="mt-2 font-semibold tracking-tight text-[var(--text)]">{formatCurrency(revision.price)}</div>
                        {revision.description && (
                          <div className="mt-2 leading-7 text-[var(--text-muted)]">{revision.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="app-btn-secondary h-11 px-5 text-sm"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={loading}
                className="app-btn-primary h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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

const StructuredBlock = ({
  checked,
  title,
  description,
  value,
  disabled,
  onToggle,
  onChange,
}: {
  checked: boolean;
  title: string;
  description: string;
  value: string;
  disabled: boolean;
  onToggle: (value: boolean) => void;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="app-card-subtle px-5 py-5">
      <label className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-[var(--text)]">{title}</div>
          <div className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{description}</div>
        </div>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onToggle(event.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
        />
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        disabled={disabled}
        className="app-field mt-4 min-h-[96px]"
        placeholder="Add the commercial details for this section."
      />
    </div>
  );
};

export default BidForm;
