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
    { label: 'Traveler briefs', value: tripRequests.length, note: 'Visible in the open queue' },
    { label: 'Live offers', value: bids.filter((bid) => bid.status === 'PENDING').length, note: 'Negotiations still active' },
    { label: 'Agency action', value: bids.filter((bid) => bid.awaitingActionBy === 'AGENCY' && bid.status === 'PENDING').length, note: 'Needs your follow-up' },
    { label: 'Accepted', value: bids.filter((bid) => bid.status === 'ACCEPTED').length, note: 'Traveler approvals secured' },
  ];

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <div>
          <div className="page-eyebrow">Marketplace</div>
          <h1 className="page-title">Traveler requests are now easier to scan, quote, and revise on every screen size.</h1>
          <p className="page-copy">
            The page focuses on demand quality, commercial fit, and negotiation state without relying on a dense desktop-only table.
          </p>
        </div>

        <div className="page-stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-note">{stat.note}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="page-toolbar">
        <div className="search-shell">
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
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="text-sm text-[var(--text-muted)]">{pagination.total} total brief(s)</div>
      </div>

      {(error || bidsError) && (
        <div className="rounded-[18px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error || bidsError}
        </div>
      )}

      {loading ? (
        <div className="surface loading-state">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Loading trip requests...</p>
        </div>
      ) : tripRequests.length === 0 ? (
        <div className="surface empty-state">
          <div className="empty-state-title">No open trip briefs found</div>
          <div className="empty-state-copy">
            {search ? 'Try widening the search terms.' : 'Traveler requests will appear here once marketplace demand is available.'}
          </div>
        </div>
      ) : (
        <>
          <div className="mobile-record-list lg:hidden">
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
                <div key={tripRequest.id} className="record-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="record-title">{tripRequest.destination}</div>
                      <div className="record-copy">
                        {tripRequest.userName || 'Traveler'} · Published {formatDate(tripRequest.createdAt)}
                      </div>
                    </div>
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

                  {(tripRequest.description || tripRequest.tripSpecs.specialRequirements) && (
                    <div className="record-copy">{tripRequest.description || tripRequest.tripSpecs.specialRequirements}</div>
                  )}

                  <div className="chip-row">
                    <span className="app-pill app-pill-neutral">{formatStatusLabel(tripRequest.tripSpecs.stayType)}</span>
                    <span className="app-pill app-pill-neutral">{tripRequest.tripSpecs.roomCount} room(s)</span>
                    <span className="app-pill app-pill-neutral">
                      {tripRequest.tripSpecs.transportRequired ? formatStatusLabel(tripRequest.tripSpecs.transportType) : 'No transport'}
                    </span>
                    <span className="app-pill app-pill-neutral">{formatStatusLabel(tripRequest.tripSpecs.mealPlan)}</span>
                  </div>

                  <div className="record-grid">
                    <div className="record-meta-block">
                      <div className="record-meta-label">Window</div>
                      <div className="record-meta-value">{formatDateRange(tripRequest.startDate, tripRequest.endDate)}</div>
                    </div>
                    <div className="record-meta-block">
                      <div className="record-meta-label">Budget</div>
                      <div className="record-meta-value">{formatCurrency(tripRequest.budget)}</div>
                    </div>
                    <div className="record-meta-block">
                      <div className="record-meta-label">Travelers</div>
                      <div className="record-meta-value">{tripRequest.travelers} traveler(s)</div>
                    </div>
                    <div className="record-meta-block">
                      <div className="record-meta-label">Your thread</div>
                      <div className="record-meta-value">{existingBid ? formatCurrency(existingBid.price) : 'No quote yet'}</div>
                    </div>
                  </div>

                  <div className="record-actions">
                    <button
                      type="button"
                      onClick={() => handleOpenOffer(tripRequest)}
                      className={`${existingBid ? 'app-btn-secondary' : 'app-btn-primary'} h-11 px-4 text-sm`}
                    >
                      {existingBid ? (existingBid.awaitingActionBy === 'AGENCY' && existingBid.status === 'PENDING' ? 'Revise offer' : 'View thread') : 'Submit offer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="app-table-shell hidden overflow-x-auto lg:block">
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
                          {tripRequest.userName || 'Traveler'} · Published {formatDate(tripRequest.createdAt)}
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
                            {existingBid.revisionCount} revision(s) · Updated {formatDate(existingBid.updatedAt)}
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
        </>
      )}

      {pagination.total > pagination.limit && (
        <div className="page-pagination">
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
