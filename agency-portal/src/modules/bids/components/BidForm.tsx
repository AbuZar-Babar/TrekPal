import { FormEvent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Bid, BidRevision, OfferDetails, TripRequest } from '../../../shared/types';
import { formatCurrency, formatDateRange } from '../../../shared/utils/formatters';

interface BidFormProps {
  tripRequest: TripRequest;
  loading: boolean;
  existingBid?: Bid;
  onCancel: () => void;
  onSubmit: (payload: { price: number; description?: string; offerDetails: OfferDetails }) => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const pretty = (v: string) =>
  v.toLowerCase().split('_').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// ── Thread message ────────────────────────────────────────────────────────────
const ThreadMessage = ({ revision, isLatest }: { revision: BidRevision; isLatest: boolean }) => {
  const isAgency = revision.actorRole === 'AGENCY';
  const inclusions = [
    revision.offerDetails.stayIncluded && 'Stay',
    revision.offerDetails.transportIncluded && 'Transport',
    revision.offerDetails.mealsIncluded && 'Meals',
  ].filter(Boolean) as string[];

  return (
    <div className={`flex flex-col gap-1 ${isAgency ? 'items-end' : 'items-start'}`}>
      {/* Actor label + time */}
      <div className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-soft)] ${isAgency ? 'flex-row-reverse' : ''}`}>
        <span>{isAgency ? 'Your offer' : 'Traveler counter'}</span>
        <span>{shortDate(revision.createdAt)}</span>
        {isLatest && (
          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${isAgency ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'bg-[var(--warning-bg)] text-[var(--warning-text)]'}`}>
            Latest
          </span>
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${
        isAgency
          ? 'rounded-tr-sm bg-[var(--primary-soft)] text-[var(--text)]'
          : 'rounded-tl-sm border border-[var(--border)] bg-[var(--panel-subtle)] text-[var(--text)]'
      }`}>
        {/* Price */}
        <div className="text-xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(revision.price)}
        </div>

        {/* Inclusions chips */}
        {inclusions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {inclusions.map((inc) => (
              <span
                key={inc}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isAgency
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--panel-strong)] text-[var(--text-muted)]'
                }`}
              >
                {inc}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {revision.description && (
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            {revision.description}
          </p>
        )}
      </div>
    </div>
  );
};

// ── Toggle switch ─────────────────────────────────────────────────────────────
const Toggle = ({
  checked, disabled, label, description, value, placeholder, onChange, onToggle,
}: {
  checked: boolean; disabled: boolean; label: string; description: string;
  value: string; placeholder: string;
  onChange: (v: string) => void; onToggle: (v: boolean) => void;
}) => (
  <div className={`rounded-xl border transition-colors ${checked ? 'border-[var(--primary-soft)] bg-[var(--primary-soft)]' : 'border-[var(--border)] bg-[var(--panel-subtle)]'}`}>
    <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3">
      <div>
        <div className="text-sm font-medium text-[var(--text)]">{label}</div>
        <div className="text-xs text-[var(--text-soft)]">{description}</div>
      </div>
      {/* Toggle pill */}
      <div
        onClick={() => !disabled && onToggle(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-[var(--primary)]' : 'bg-[var(--panel-strong)]'} ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </label>
    <AnimatePresence initial={false}>
      {checked && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="overflow-hidden px-4 pb-3"
        >
          <textarea
            rows={2}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="app-field min-h-[72px] text-sm"
          />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ bid }: { bid?: Bid }) => {
  if (!bid) return null;
  if (bid.status === 'ACCEPTED')
    return <span className="rounded-full bg-[var(--success-bg)] px-3 py-1 text-xs font-semibold text-[var(--success-text)]">Accepted</span>;
  if (bid.status === 'REJECTED')
    return <span className="rounded-full bg-[var(--danger-bg)] px-3 py-1 text-xs font-semibold text-[var(--danger-text)]">Rejected</span>;
  if (bid.awaitingActionBy === 'AGENCY')
    return <span className="rounded-full bg-[var(--warning-bg)] px-3 py-1 text-xs font-semibold text-[var(--warning-text)]">● Your move</span>;
  return <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">Traveler reviewing</span>;
};

// ── Main component ────────────────────────────────────────────────────────────
const BidForm = ({ tripRequest, loading, existingBid, onCancel, onSubmit }: BidFormProps) => {
  const [price, setPrice]                   = useState('');
  const [description, setDescription]       = useState('');
  const [stayIncluded, setStayIncluded]     = useState(false);
  const [stayDetails, setStayDetails]       = useState('');
  const [transportIncluded, setTransportIncluded] = useState(false);
  const [transportDetails, setTransportDetails]   = useState('');
  const [mealsIncluded, setMealsIncluded]   = useState(false);
  const [mealDetails, setMealDetails]       = useState('');
  const [extras, setExtras]                 = useState('');
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => {
    if (!existingBid) {
      setPrice(''); setDescription(''); setStayIncluded(false); setStayDetails('');
      setTransportIncluded(false); setTransportDetails('');
      setMealsIncluded(false); setMealDetails(''); setExtras('');
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
    existingBid && (existingBid.status !== 'PENDING' || existingBid.awaitingActionBy !== 'AGENCY'),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isReadOnly) { onCancel(); return; }
    const num = Number(price);
    if (!Number.isFinite(num) || num <= 0) { setError('Enter a valid offer amount.'); return; }
    setError(null);
    await onSubmit({
      price: num,
      description: description.trim() || undefined,
      offerDetails: {
        stayIncluded, stayDetails: stayDetails.trim(),
        transportIncluded, transportDetails: transportDetails.trim(),
        mealsIncluded, mealDetails: mealDetails.trim(),
        extras: extras.trim(),
      },
    });
  };

  const revisions = existingBid?.revisions ?? [];
  const hasThread = revisions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-[var(--panel)] shadow-2xl sm:rounded-2xl"
        style={{ maxHeight: '92vh' }}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Modal header ───────────────────────────────────── */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
                {existingBid ? 'Offer thread' : 'New offer'}
              </h2>
              <StatusBadge bid={existingBid} />
            </div>
            <p className="mt-0.5 text-sm text-[var(--text-soft)]">
              {tripRequest.destination} · {formatDateRange(tripRequest.startDate, tripRequest.endDate)} · {tripRequest.travelers} travelers
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="h-8 w-8 shrink-0 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Trip brief strip ───────────────────────────────── */}
        <div className="shrink-0 flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--border)] bg-[var(--panel-subtle)] px-6 py-3">
          {[
            { label: 'Budget', value: formatCurrency(tripRequest.budget) },
            { label: 'Stay', value: pretty(tripRequest.tripSpecs.stayType) },
            { label: 'Rooms', value: `${tripRequest.tripSpecs.roomCount}× ${pretty(tripRequest.tripSpecs.roomPreference)}` },
            { label: 'Meals', value: pretty(tripRequest.tripSpecs.mealPlan) },
            { label: 'Transport', value: tripRequest.tripSpecs.transportRequired ? pretty(tripRequest.tripSpecs.transportType) : 'Not required' },
            { label: 'Competing bids', value: tripRequest.bidsCount },
            existingBid ? { label: 'Revisions', value: existingBid.revisionCount } : null,
          ].filter(Boolean).map((item) => (
            <div key={item!.label}>
              <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">{item!.label}</div>
              <div className="text-xs font-semibold text-[var(--text)]">{item!.value}</div>
            </div>
          ))}
        </div>

        {/* ── Scrollable body ────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* Left: form */}
            <div className={`flex-1 min-w-0 overflow-y-auto px-6 py-5 space-y-4 ${hasThread ? 'border-r border-[var(--border)]' : ''}`}>

              {/* Status context */}
              {!isReadOnly && (
                <div className={`rounded-xl border px-4 py-3 text-sm ${
                  existingBid?.awaitingActionBy === 'AGENCY'
                    ? 'border-[var(--warning-bg)] bg-[var(--warning-bg)] text-[var(--warning-text)]'
                    : 'border-[var(--border)] bg-[var(--panel-subtle)] text-[var(--text-muted)]'
                }`}>
                  {!existingBid
                    ? 'Build a clear offer: set your price, toggle what\'s included, and add any extras.'
                    : 'The traveler has countered. Revise the price or scope and send your response.'}
                </div>
              )}

              {isReadOnly && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-3 text-sm text-[var(--text-muted)]">
                  {existingBid?.status === 'ACCEPTED'
                    ? '✓ This offer was accepted and converted to a booking.'
                    : existingBid?.status === 'REJECTED'
                    ? 'This thread is closed — another agency was selected.'
                    : 'Waiting for the traveler to review your latest offer.'}
                </div>
              )}

              {/* Price + note */}
              {!isReadOnly && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                      Total offer (PKR)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="app-field text-lg font-semibold"
                      placeholder="e.g. 85000"
                    />
                    {tripRequest.budget && (
                      <p className="mt-1 text-xs text-[var(--text-soft)]">
                        Traveler budget: {formatCurrency(tripRequest.budget)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                      Message to traveler
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="app-field min-h-[80px] text-sm"
                      placeholder="Explain your pricing, what makes your offer stand out, or any adjustments from the last revision."
                    />
                  </div>
                </div>
              )}

              {/* Inclusions */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                  What's included
                </div>
                <Toggle
                  checked={stayIncluded} disabled={isReadOnly}
                  label="Accommodation" description="Hotel, resort, or guesthouse"
                  value={stayDetails} placeholder="Hotel name, tier, city, room type…"
                  onToggle={setStayIncluded} onChange={setStayDetails}
                />
                <Toggle
                  checked={transportIncluded} disabled={isReadOnly}
                  label="Transport" description="Vehicles, transfers, driver"
                  value={transportDetails} placeholder="Vehicle class, pickup points, driver included…"
                  onToggle={setTransportIncluded} onChange={setTransportDetails}
                />
                <Toggle
                  checked={mealsIncluded} disabled={isReadOnly}
                  label="Meals" description="Breakfast, half-board, full-board"
                  value={mealDetails} placeholder="Meal plan details, dietary options…"
                  onToggle={setMealsIncluded} onChange={setMealDetails}
                />
              </div>

              {/* Extras */}
              {!isReadOnly && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                    Extras
                  </label>
                  <textarea
                    rows={2}
                    value={extras}
                    onChange={(e) => setExtras(e.target.value)}
                    className="app-field min-h-[64px] text-sm"
                    placeholder="Guides, sightseeing, welcome kits, flexible timing…"
                  />
                </div>
              )}
            </div>

            {/* Right: thread */}
            {hasThread && (
              <div className="hidden w-80 shrink-0 overflow-y-auto px-5 py-5 lg:flex lg:flex-col">
                <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                  Negotiation thread
                </div>
                <div className="flex flex-col gap-4">
                  {revisions.map((rev, i) => (
                    <ThreadMessage
                      key={rev.id}
                      revision={rev}
                      isLatest={i === revisions.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ─────────────────────────────────────────── */}
          <div className="shrink-0 flex items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-4">
            {error && (
              <p className="text-sm text-[var(--danger-text)]">{error}</p>
            )}
            {!error && <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="h-9 rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                {isReadOnly ? 'Close' : 'Cancel'}
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Saving…' : existingBid ? 'Send revision' : 'Submit offer'}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BidForm;
