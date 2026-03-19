import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { TripRequest } from '../../../shared/types';
import BidForm from '../../bids/components/BidForm';
import { createBid, fetchAgencyBids } from '../../bids/store/bidsSlice';
import { fetchTripRequests } from '../store/tripRequestsSlice';
import TripRequestCard from './TripRequestCard';

const TripRequestList = () => {
  const dispatch = useDispatch();
  const { tripRequests, loading, error, pagination } = useSelector(
    (state: RootState) => state.tripRequests
  );
  const {
    bids,
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
      }) as any
    );
  }, [dispatch, page, search]);

  useEffect(() => {
    dispatch(fetchAgencyBids({ limit: 100 }) as any);
  }, [dispatch]);

  const bidsByTripRequestId = useMemo(() => {
    return bids.reduce<Record<string, typeof bids[number]>>((accumulator, bid) => {
      accumulator[bid.tripRequestId] = bid;
      return accumulator;
    }, {});
  }, [bids]);

  const handleBidSubmit = async ({ price, description }: { price: number; description?: string }) => {
    if (!selectedTripRequest) {
      return;
    }

    try {
      await dispatch(
        createBid({
          tripRequestId: selectedTripRequest.id,
          price,
          description,
        }) as any
      ).unwrap();

      setSelectedTripRequest(null);
      dispatch(fetchAgencyBids({ limit: 100 }) as any);
      dispatch(
        fetchTripRequests({
          page,
          limit: 20,
          search: search || undefined,
        }) as any
      );
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Request Marketplace</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse pending traveler requests and submit bids directly from the portal.
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          {bids.length} bid{bids.length === 1 ? '' : 's'} submitted by your agency
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search by destination or trip description..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {(error || bidsError) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || bidsError}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
          <p className="mt-4 text-sm text-gray-500">Loading trip requests...</p>
        </div>
      ) : tripRequests.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
            <svg className="h-8 w-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">No open requests found</h2>
          <p className="mt-2 text-sm text-gray-500">
            {search ? 'Try adjusting your search terms.' : 'Traveler requests will appear here when available.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {tripRequests.map((tripRequest) => (
            <TripRequestCard
              key={tripRequest.id}
              tripRequest={tripRequest}
              existingBid={bidsByTripRequestId[tripRequest.id]}
              onBid={setSelectedTripRequest}
            />
          ))}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page === 1}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-600">
            Page {page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page >= Math.ceil(pagination.total / pagination.limit)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {selectedTripRequest && (
        <BidForm
          tripRequest={selectedTripRequest}
          loading={bidsLoading}
          onCancel={() => setSelectedTripRequest(null)}
          onSubmit={handleBidSubmit}
        />
      )}
    </div>
  );
};

export default TripRequestList;
