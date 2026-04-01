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
    if (!selectedTripRequest) {
      return null;
    }

    if (selectedBid && selectedBid.tripRequestId === selectedTripRequest.id) {
      return selectedBid;
    }

    return bidsByTripRequestId[selectedTripRequest.id] ?? null;
  }, [bidsByTripRequestId, selectedBid, selectedTripRequest]);

  const refreshMarketplace = () => {
    dispatch(fetchAgencyBids({ limit: 100 }) as any);
    dispatch(
      fetchTripRequests({
        page,
        limit: 20,
        search: search || undefined,
      }) as any,
    );
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
      return;
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
    if (!selectedTripRequest) {
      return;
    }

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
      return;
    }
  };

  const stats = [
    { label: 'Traveler briefs', value: tripRequests.length },
    { label: 'Agency live offers', value: bids.filter((bid) => bid.status === 'PENDING').length },
    { label: 'Awaiting agency action', value: bids.filter((bid) => bid.awaitingActionBy === 'AGENCY' && bid.status === 'PENDING').length },
    { label: 'Accepted threads', value: bids.filter((bid) => bid.status === 'ACCEPTED').length },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.18fr,0.82fr]">
        <div className="app-card px-6 py-6 md:px-8 md:py-8">
          <div className="app-section-label">Marketplace</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Structured traveler briefs and live negotiations</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            Review commercial trip requirements, compare the traveler&apos;s requested structure against your inventory, and respond with one negotiated offer thread per agency.
          </p>
        </div>

        <div className="app-panel-dark px-6 py-6">
          <div className="app-section-label text-white/55">Commercial queue</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Negotiation position</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">{stat.label}</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="app-card px-5 py-5">
        <div className="grid gap-3 lg:grid-cols-[1fr,auto] lg:items-center">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search by destination or traveler notes..."
              className="app-field pl-11"
            />
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-soft)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-sm text-[var(--text-muted)]">{pagination.total} total brief(s)</div>
        </div>
      </div>

      {(error || bidsError) && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error || bidsError}
        </div>
      )}

      {loading ? (
        <div className="app-table-shell px-6 py-14 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Loading trip requests...</p>
        </div>
      ) : tripRequests.length === 0 ? (
        <div className="app-table-shell px-6 py-14 text-center">
          <div className="text-lg font-semibold tracking-tight text-[var(--text)]">No open trip briefs found</div>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            {search ? 'Try widening the search terms.' : 'Traveler requests will appear here once the marketplace has matching demand.'}
          </p>
        </div>
      ) : (
        <div className="app-table-shell overflow-x-auto">
          <table className="app-table min-w-[1120px]">
            <thead>
              <tr>
                <th>Traveler brief</th>
                <th>Window and budget</th>
                <th>Requested structure</th>
                <th>Your thread</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tripRequests.map((tripRequest) => {
                const existingBid = bidsByTripRequestId[tripRequest.id];
                const bidStateLabel = !existingBid
                  ? 'Open'
                  : existingBid.status === 'PENDING'
                    ? existingBid.awaitingActionBy === 'AGENCY'
                      ? 'Agency turn'
                      : 'Traveler review'
                    : formatStatusLabel(existingBid.status);

                return (
                  <tr key={tripRequest.id}>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">{tripRequest.destination}</div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">
                        {tripRequest.userName || 'Traveler'} • Published {formatDate(tripRequest.createdAt)}
                      </div>
                      {(tripRequest.description || tripRequest.tripSpecs.specialRequirements) && (
                        <div className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                          {tripRequest.description || tripRequest.tripSpecs.specialRequirements}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">{formatDateRange(tripRequest.startDate, tripRequest.endDate)}</div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">{tripRequest.travelers} traveler(s)</div>
                      <div className="mt-3 text-sm font-semibold text-[var(--text)]">{formatCurrency(tripRequest.budget)}</div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">{tripRequest.bidsCount} agency thread(s)</div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <span className="app-pill app-pill-neutral">{formatStatusLabel(tripRequest.tripSpecs.stayType)}</span>
                        <span className="app-pill app-pill-neutral">{tripRequest.tripSpecs.roomCount} room(s)</span>
                        <span className="app-pill app-pill-neutral">
                          {tripRequest.tripSpecs.transportRequired ? formatStatusLabel(tripRequest.tripSpecs.transportType) : 'No transport'}
                        </span>
                        <span className="app-pill app-pill-neutral">{formatStatusLabel(tripRequest.tripSpecs.mealPlan)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">
                        {existingBid ? formatCurrency(existingBid.price) : 'No quote yet'}
                      </div>
                      <div className="mt-2">
                        <span className={`app-pill ${
                          !existingBid
                            ? 'app-pill-neutral'
                            : existingBid.status === 'ACCEPTED'
                              ? 'app-pill-success'
                              : existingBid.status === 'REJECTED'
                                ? 'app-pill-danger'
                                : existingBid.awaitingActionBy === 'AGENCY'
                                  ? 'app-pill-warning'
                                  : 'app-pill-neutral'
                        }`}>
                          {bidStateLabel}
                        </span>
                      </div>
                      {existingBid && (
                        <div className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                          {existingBid.revisionCount} revision(s) • Updated {formatDate(existingBid.updatedAt)}
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleOpenOffer(tripRequest)}
                        className={`${existingBid ? 'app-btn-secondary' : 'app-btn-primary'} h-11 px-4 text-sm`}
                      >
                        {existingBid ? (existingBid.awaitingActionBy === 'AGENCY' && existingBid.status === 'PENDING' ? 'Revise offer' : 'View thread') : 'Submit offer'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page === 1}
            className="app-btn-secondary h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-[var(--text-muted)]">
            Page {page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page >= Math.ceil(pagination.total / pagination.limit)}
            className="app-btn-secondary h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
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
