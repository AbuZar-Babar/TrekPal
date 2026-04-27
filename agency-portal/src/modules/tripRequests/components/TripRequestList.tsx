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
import {
  formatCurrency,
  formatDate,
  formatDateRange,
  formatStatusLabel,
} from '../../../shared/utils/formatters';
import { fetchTripRequests } from '../store/tripRequestsSlice';

const TripRequestList = () => {
  const dispatch = useDispatch();
  const { tripRequests, loading, error, pagination } = useSelector((state: RootState) => state.tripRequests);
  const {
    bids,
    selectedBid,
    loading: bidsLoading,
    error: bidsError,
  } = useSelector((state: RootState) => state.bids);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedTripRequest, setSelectedTripRequest] = useState<TripRequest | null>(null);

  useEffect(() => {
    dispatch(
      fetchTripRequests({
        page,
        limit: 20,
        search: search || undefined,
      }) as any,
    );
  }, [dispatch, page, search]);

  useEffect(() => {
    dispatch(fetchAgencyBids({ limit: 100 }) as any);
  }, [dispatch]);

  const bidsByTripRequestId = useMemo(
    () => bids.reduce<Record<string, Bid>>((accumulator, bid) => ({ ...accumulator, [bid.tripRequestId]: bid }), {}),
    [bids],
  );

  const modalBid = useMemo(() => {
    if (!selectedTripRequest) return null;
    if (selectedBid && selectedBid.tripRequestId === selectedTripRequest.id) return selectedBid;
    return bidsByTripRequestId[selectedTripRequest.id] ?? null;
  }, [bidsByTripRequestId, selectedBid, selectedTripRequest]);

  const refreshMarketplace = () => {
    dispatch(fetchAgencyBids({ limit: 100 }) as any);
    dispatch(fetchTripRequests({ page, limit: 20, search: search || undefined }) as any);
  };

  const handleOpenOffer = async (tripRequest: TripRequest) => {
    setSelectedTripRequest(tripRequest);
    const existingBid = bidsByTripRequestId[tripRequest.id];

    if (!existingBid) {
      dispatch(clearSelectedBid());
      return;
    }

    try {
      await dispatch(fetchBidThread(existingBid.id) as any).unwrap();
    } catch {
      // Error handled by store
    }
  };

  const handleBidSubmit = async ({
    price,
    description,
    offerDetails,
  }: {
    price: number;
    description?: string;
    offerDetails: OfferDetails;
  }) => {
    if (!selectedTripRequest) return;

    try {
      if (modalBid) {
        await dispatch(
          createCounterOffer({
            bidId: modalBid.id,
            price,
            description,
            offerDetails,
          }) as any,
        ).unwrap();
      } else {
        await dispatch(
          createBid({
            tripRequestId: selectedTripRequest.id,
            price,
            description,
            offerDetails,
          }) as any,
        ).unwrap();
      }

      setSelectedTripRequest(null);
      dispatch(clearSelectedBid());
      refreshMarketplace();
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--text)]">Traveler Requests</h2>
        <div className="text-xs font-medium text-[var(--text-soft)] uppercase tracking-wider">
          {pagination.total} Live Briefs
        </div>
      </section>

      <div className="page-toolbar surface">
        <div className="search-shell">
          <svg className="h-5 w-5 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Filter requests..."
            className="border-0 bg-transparent p-0 text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {(error || bidsError) && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error || bidsError}
        </div>
      )}

      {loading ? (
        <div className="surface py-20 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : tripRequests.length === 0 ? (
        <div className="surface py-20 text-center">
          <p className="text-[var(--text-soft)]">No active requests found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tripRequests.map((tripRequest) => {
            const existingBid = bidsByTripRequestId[tripRequest.id];
            return (
              <div key={tripRequest.id} className="surface flex flex-col p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text)]">{tripRequest.destination}</h3>
                    <p className="text-sm text-[var(--text-soft)]">
                      {tripRequest.userName || 'Anonymous'} · {formatDate(tripRequest.createdAt)}
                    </p>
                  </div>
                  <span className={`app-pill ${
                    !existingBid ? 'app-pill-neutral' : 
                    existingBid.status === 'ACCEPTED' ? 'app-pill-success' : 
                    existingBid.status === 'REJECTED' ? 'app-pill-danger' : 'app-pill-warning'
                  }`}>
                    {existingBid ? existingBid.status : 'Open'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-[var(--panel-subtle)] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Budget</div>
                    <div className="text-sm font-bold text-[var(--text)]">{formatCurrency(tripRequest.budget)}</div>
                  </div>
                  <div className="rounded-xl bg-[var(--panel-subtle)] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Travelers</div>
                    <div className="text-sm font-bold text-[var(--text)]">{tripRequest.travelers} Persons</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs text-[var(--text-soft)] bg-[var(--panel-subtle)] px-2 py-1 rounded-md">
                    {formatDateRange(tripRequest.startDate, tripRequest.endDate)}
                  </span>
                  <span className="text-xs text-[var(--text-soft)] bg-[var(--panel-subtle)] px-2 py-1 rounded-md">
                    {formatStatusLabel(tripRequest.tripSpecs.stayType)}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
                  <div className="text-xs text-[var(--text-muted)]">
                    {existingBid ? `Current Bid: ${formatCurrency(existingBid.price)}` : 'No bid yet'}
                  </div>
                  <button
                    onClick={() => handleOpenOffer(tripRequest)}
                    className={`${existingBid ? 'app-btn-secondary' : 'app-btn-primary'} h-9 px-4 text-xs`}
                  >
                    {existingBid ? 'View Thread' : 'Submit Offer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="app-btn-secondary h-10 px-4 text-xs disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-medium text-[var(--text-soft)]">
            Page {page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(pagination.total / pagination.limit)}
            className="app-btn-secondary h-10 px-4 text-xs disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {selectedTripRequest && (
        <BidForm
          tripRequest={selectedTripRequest}
          existingBid={modalBid ?? undefined}
          loading={bidsLoading}
          onCancel={() => {
            setSelectedTripRequest(null);
            dispatch(clearSelectedBid());
          }}
          onSubmit={handleBidSubmit}
        />
      )}
    </div>
  );
};

export default TripRequestList;
