import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import BidForm from './BidForm';
import {
  clearSelectedBid,
  createCounterOffer,
  fetchAgencyBids,
  fetchBidThread,
} from '../store/bidsSlice';
import { RootState } from '../../../store';
import { Bid, OfferDetails, TripRequest } from '../../../shared/types';
import { formatCurrency, formatDateRange } from '../../../shared/utils/formatters';
import { tripRequestsService } from '../../tripRequests/services/tripRequestsService';

// ── Helpers ──────────────────────────────────────────────────────────────────
const BidStatusBadge = ({ bid }: { bid: Bid }) => {
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
const BidList = () => {
  const dispatch = useDispatch();
  const { bids, loading, error, selectedBid } = useSelector((state: RootState) => state.bids);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<TripRequest | null>(null);
  const [selectedBidForModal, setSelectedBidForModal] = useState<Bid | null>(null);
  const [fetchingRequestForBidId, setFetchingRequestForBidId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAgencyBids({ limit: 100 }) as any);
  }, [dispatch]);

  const handleOpenBid = async (bid: Bid) => {
    setFetchingRequestForBidId(bid.id);
    try {
      const tr = await tripRequestsService.getTripRequestById(bid.tripRequestId);
      setSelectedRequest(tr);
      setSelectedBidForModal(bid);
      await dispatch(fetchBidThread(bid.id) as any).unwrap();
    } catch (err) {
      console.error('Failed to load trip request details:', err);
    } finally {
      setFetchingRequestForBidId(null);
    }
  };

  const handleBidSubmit = async ({ price, description, offerDetails, hotelId, roomId, vehicleId, dedicatedVehicle }: {
    price: number; description?: string; offerDetails: OfferDetails;
    hotelId?: string; roomId?: string; vehicleId?: string; dedicatedVehicle?: boolean;
  }) => {
    if (!selectedBidForModal) return;
    try {
      await dispatch(createCounterOffer({
        bidId: selectedBidForModal.id,
        price,
        description,
        offerDetails,
        hotelId,
        roomId,
        vehicleId,
        dedicatedVehicle,
      }) as any).unwrap();

      setSelectedRequest(null);
      setSelectedBidForModal(null);
      dispatch(clearSelectedBid());
      dispatch(fetchAgencyBids({ limit: 100 }) as any);
    } catch (err) {
      console.error('Failed to submit counteroffer:', err);
    }
  };

  const STATUS_TABS = ['', 'PENDING', 'ACCEPTED', 'REJECTED'] as const;

  const filteredBids = useMemo(() => {
    return bids.filter((bid) => {
      // Status filter
      if (statusFilter && bid.status !== statusFilter) return false;

      // Search filter (by destination)
      if (search) {
        const dest = bid.tripDestination || '';
        if (!dest.toLowerCase().includes(search.toLowerCase())) return false;
      }

      return true;
    });
  }, [bids, statusFilter, search]);

  const limit = 10;
  const totalPages = Math.ceil(filteredBids.length / limit);
  const paginatedBids = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredBids.slice(start, start + limit);
  }, [filteredBids, page, limit]);

  return (
    <div className="space-y-5">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">My Bids</h1>
          <p className="mt-0.5 text-sm text-[var(--text-soft)]">
            {filteredBids.length} submitted offers
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
            onClick={() => { setPage(1); setStatusFilter(s); }}
            className={`h-8 rounded-lg px-3.5 text-xs font-semibold transition-colors ${
              statusFilter === s
                ? 'bg-[var(--primary)] text-white'
                : 'border border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {/* ── List ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : paginatedBids.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[var(--text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm text-[var(--text-soft)]">No bids found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedBids.map((bid) => {
            const urgent = bid.awaitingActionBy === 'AGENCY' && bid.status === 'PENDING';
            const isFetchingThis = fetchingRequestForBidId === bid.id;

            return (
              <div
                key={bid.id}
                className={`rounded-xl border bg-[var(--panel)] transition-colors ${
                  urgent ? 'border-[var(--warning-text)]' : 'border-[var(--border)]'
                }`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-semibold text-[var(--text)] truncate">
                        {bid.tripDestination || 'Trip Proposal'}
                      </h3>
                      <BidStatusBadge bid={bid} />
                      {urgent && (
                        <span className="text-[10px] font-bold text-[var(--warning-text)]">ACTION NEEDED</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-soft)]">
                      Submitted on {new Date(bid.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-[var(--text-soft)]">Your offer</div>
                    <div className="text-lg font-semibold text-[var(--text)]">{formatCurrency(bid.price)}</div>
                  </div>
                </div>

                {/* Key metrics row */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--border)] px-5 py-3 text-xs">
                  {bid.tripStartDate && bid.tripEndDate && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Dates</div>
                      <div className="font-medium text-[var(--text)]">{formatDateRange(bid.tripStartDate, bid.tripEndDate)}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Revisions</div>
                    <div className="font-medium text-[var(--text)]">{bid.revisionCount} rounds</div>
                  </div>
                  {bid.hotel && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Hotel Offered</div>
                      <div className="font-medium text-[var(--text)]">{bid.hotel.name}</div>
                    </div>
                  )}
                  {bid.vehicle && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Vehicle Offered</div>
                      <div className="font-medium text-[var(--text)]">{bid.vehicle.make} {bid.vehicle.model}</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {bid.description && (
                  <div className="border-t border-[var(--border)] px-5 py-3 text-xs">
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)] mb-0.5">Offer description</div>
                    <p className="text-[var(--text-muted)] line-clamp-2">{bid.description}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end border-t border-[var(--border)] px-5 py-3">
                  <button
                    type="button"
                    disabled={isFetchingThis}
                    onClick={() => handleOpenBid(bid)}
                    className={`h-8 rounded-lg px-4 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      urgent
                        ? 'bg-[var(--primary)] text-white hover:opacity-90'
                        : 'border border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {isFetchingThis && (
                      <div className="h-3 w-3 animate-spin rounded-full border border-[var(--border)] border-t-transparent" />
                    )}
                    {urgent ? 'Revise offer' : 'View details & thread'}
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
      {selectedRequest && (
        <BidForm
          tripRequest={selectedRequest}
          existingBid={selectedBid ?? undefined}
          loading={loading}
          onCancel={() => {
            setSelectedRequest(null);
            setSelectedBidForModal(null);
            dispatch(clearSelectedBid());
          }}
          onSubmit={handleBidSubmit}
        />
      )}
    </div>
  );
};

export default BidList;
