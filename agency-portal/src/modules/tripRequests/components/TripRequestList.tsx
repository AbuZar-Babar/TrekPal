import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import BidForm from '../../bids/components/BidForm';
import {
  clearSelectedBid,
  createBid,
  createCounterOffer,
  fetchAgencyBids,
  fetchBidThread,
} from '../../bids/store/bidsSlice';
import { RootState } from '../../../store';
import { Bid, OfferDetails, TripRequest } from '../../../shared/types';
import { formatCurrency, formatDateRange } from '../../../shared/utils/formatters';
import { fetchTripRequests } from '../store/tripRequestsSlice';

// ── Helpers ──────────────────────────────────────────────────────────────────
const pretty = (v: string) =>
  v.toLowerCase().split('_').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

const BidStatusBadge = ({ bid }: { bid?: Bid }) => {
  if (!bid) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--panel-subtle)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-soft)]">
      Open
    </span>
  );
  if (bid.status === 'ACCEPTED') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-bg)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--success-text)]">
      Accepted
    </span>
  );
  if (bid.status === 'REJECTED') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--danger-bg)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--danger-text)]">
      Rejected
    </span>
  );
  if (bid.awaitingActionBy === 'AGENCY') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--warning-bg)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--warning-text)]">
      ● Your move
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">
      Awaiting traveler
    </span>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const TripRequestList = () => {
  const dispatch = useDispatch();
  const { tripRequests, loading, error, pagination } = useSelector((state: RootState) => state.tripRequests);
  const { bids, selectedBid, loading: bidsLoading, error: bidsError } = useSelector((state: RootState) => state.bids);

  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<TripRequest | null>(null);

  useEffect(() => {
    dispatch(fetchTripRequests({ page, limit: 20, search: search || undefined }) as any);
  }, [dispatch, page, search]);

  useEffect(() => {
    dispatch(fetchAgencyBids({ limit: 100 }) as any);
  }, [dispatch]);

  const bidsByRequest = useMemo(
    () => bids.reduce<Record<string, Bid>>((acc, b) => ({ ...acc, [b.tripRequestId]: b }), {}),
    [bids],
  );

  const modalBid = useMemo(() => {
    if (!selected) return null;
    if (selectedBid && selectedBid.tripRequestId === selected.id) return selectedBid;
    return bidsByRequest[selected.id] ?? null;
  }, [selected, selectedBid, bidsByRequest]);

  const handleOpen = async (tr: TripRequest) => {
    setSelected(tr);
    const existing = bidsByRequest[tr.id];
    if (!existing) { dispatch(clearSelectedBid()); return; }
    try { await dispatch(fetchBidThread(existing.id) as any).unwrap(); } catch { /* handled */ }
  };

  const handleBidSubmit = async ({ price, description, offerDetails, hotelId, roomId, vehicleId }: {
    price: number; description?: string; offerDetails: OfferDetails;
    hotelId?: string; roomId?: string; vehicleId?: string;
  }) => {
    if (!selected) return;
    try {
      if (modalBid) {
        await dispatch(createCounterOffer({ bidId: modalBid.id, price, description, offerDetails, hotelId, roomId, vehicleId }) as any).unwrap();
      } else {
        await dispatch(createBid({ tripRequestId: selected.id, price, description, offerDetails, hotelId, roomId, vehicleId }) as any).unwrap();
      }
      setSelected(null);
      dispatch(clearSelectedBid());
      dispatch(fetchAgencyBids({ limit: 100 }) as any);
      dispatch(fetchTripRequests({ page, limit: 20, search: search || undefined }) as any);
    } catch { /* handled */ }
  };

  const STATUS_TABS = ['', 'PENDING', 'ACCEPTED', 'CANCELLED'] as const;

  const filtered = useMemo(() => {
    if (!statusFilter) return tripRequests;
    return tripRequests.filter((t) => t.status === statusFilter);
  }, [tripRequests, statusFilter]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-5">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Requests</h1>
          <p className="mt-0.5 text-sm text-[var(--text-soft)]">
            {pagination.total} live traveler briefs
          </p>
        </div>
        {/* Search */}
        <div className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 text-sm min-w-[200px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-[var(--text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search destination…"
            className="flex-1 border-0 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none"
          />
        </div>
      </div>

      {/* ── Status tabs ─────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button
            key={s || 'ALL'}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`h-8 rounded-lg px-3.5 text-xs font-semibold transition-colors ${
              statusFilter === s
                ? 'bg-[var(--primary)] text-white'
                : 'border border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {(error || bidsError) && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error || bidsError}
        </div>
      )}

      {/* ── List ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[var(--text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm text-[var(--text-soft)]">No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tr) => {
            const bid = bidsByRequest[tr.id];
            const actionLabel = !bid ? 'Submit offer' : bid.status !== 'PENDING' ? 'View thread' : bid.awaitingActionBy === 'AGENCY' ? 'Revise offer' : 'View thread';
            const urgent = bid?.awaitingActionBy === 'AGENCY' && bid?.status === 'PENDING';

            return (
              <div
                key={tr.id}
                className={`rounded-xl border bg-[var(--panel)] transition-colors ${
                  urgent ? 'border-[var(--warning-text)]' : 'border-[var(--border)]'
                }`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-semibold text-[var(--text)] truncate">{tr.destination}</h3>
                      <BidStatusBadge bid={bid} />
                      {urgent && (
                        <span className="text-[10px] font-bold text-[var(--warning-text)]">ACTION NEEDED</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-soft)]">
                      {tr.userName || 'Traveler'} · {new Date(tr.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {bid && (
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-[var(--text-soft)]">Your offer</div>
                      <div className="text-sm font-semibold text-[var(--text)]">{formatCurrency(bid.price)}</div>
                    </div>
                  )}
                </div>

                {/* Key metrics row */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--border)] px-5 py-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Dates</div>
                    <div className="text-xs font-medium text-[var(--text)]">{formatDateRange(tr.startDate, tr.endDate)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Travelers</div>
                    <div className="text-xs font-medium text-[var(--text)]">{tr.travelers} persons</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Budget</div>
                    <div className="text-xs font-medium text-[var(--text)]">{tr.budget ? formatCurrency(tr.budget) : 'Flexible'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Stay</div>
                    <div className="text-xs font-medium text-[var(--text)]">{pretty(tr.tripSpecs.stayType)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Rooms</div>
                    <div className="text-xs font-medium text-[var(--text)]">{tr.tripSpecs.roomCount}× {pretty(tr.tripSpecs.roomPreference)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Meals</div>
                    <div className="text-xs font-medium text-[var(--text)]">{pretty(tr.tripSpecs.mealPlan)}</div>
                  </div>
                  {tr.tripSpecs.transportRequired && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Transport</div>
                      <div className="text-xs font-medium text-[var(--text)]">{pretty(tr.tripSpecs.transportType)}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Bids</div>
                    <div className="text-xs font-medium text-[var(--text)]">{tr.bidsCount}</div>
                  </div>
                </div>

                {/* Preferred hotel / vehicle */}
                {(tr.hotel || tr.vehicle) && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] px-5 py-2.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-soft)]">Preferred:</span>
                    {tr.hotel && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--panel-subtle)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--text)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3 w-3 shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7h14v14M9 11h2m2 0h2M9 15h2m2 0h2" />
                        </svg>
                        {tr.hotel.name}{tr.room ? ` · ${tr.room.type}` : ''}
                      </span>
                    )}
                    {tr.vehicle && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--panel-subtle)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--text)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3 w-3 shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l1.5-5h11L19 13M5 13v5h2m12-5v5h-2M5 13h14M7 18a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
                        </svg>
                        {tr.vehicle.make} {tr.vehicle.model}
                      </span>
                    )}
                  </div>
                )}

                {/* Description + action */}
                {(tr.description || tr.tripSpecs.specialRequirements) && (
                  <div className="border-t border-[var(--border)] px-5 py-3">
                    {tr.description && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2">{tr.description}</p>
                    )}
                    {tr.tripSpecs.specialRequirements && (
                      <p className="mt-1 text-xs text-[var(--warning-text)]">
                        ⚠ {tr.tripSpecs.specialRequirements}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end border-t border-[var(--border)] px-5 py-3">
                  <button
                    type="button"
                    onClick={() => handleOpen(tr)}
                    className={`h-8 rounded-lg px-4 text-xs font-semibold transition-colors ${
                      urgent || !bid
                        ? 'bg-[var(--primary)] text-white hover:opacity-90'
                        : 'border border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {actionLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium disabled:opacity-40">
            ← Prev
          </button>
          <span className="text-xs text-[var(--text-soft)]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
            className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium disabled:opacity-40">
            Next →
          </button>
        </div>
      )}

      {/* ── Bid form modal ───────────────────────────────────── */}
      {selected && (
        <BidForm
          tripRequest={selected}
          existingBid={modalBid ?? undefined}
          loading={bidsLoading}
          onCancel={() => { setSelected(null); dispatch(clearSelectedBid()); }}
          onSubmit={handleBidSubmit}
        />
      )}
    </div>
  );
};

export default TripRequestList;
