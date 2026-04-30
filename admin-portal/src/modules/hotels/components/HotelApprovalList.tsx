import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../store';
import EntityDetailModal from '../../../shared/components/management/EntityDetailModal';
import { formatDate, getInitials } from '../../../shared/utils/formatters';
import { approveHotel, fetchHotels, rejectHotel } from '../store/hotelSlice';

const statusClassMap: Record<string, string> = {
  PENDING: 'sovereign-pill sovereign-pill-warning',
  APPROVED: 'sovereign-pill sovereign-pill-success',
  REJECTED: 'sovereign-pill sovereign-pill-danger',
};

const HotelApprovalList = () => {
  const dispatch = useDispatch();
  const { hotels, loading, error, pagination } = useSelector((state: RootState) => state.hotels);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    dispatch(
      fetchHotels({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      }) as any
    );
  }, [dispatch, page, search, statusFilter]);

  useEffect(() => {
    if (selectedHotelId && !hotels.some((hotel) => hotel.id === selectedHotelId)) {
      setSelectedHotelId(null);
      setIsDetailOpen(false);
    }
  }, [hotels, selectedHotelId]);

  const selectedHotel = hotels.find((hotel) => hotel.id === selectedHotelId) ?? null;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  const tabCounts = useMemo(() => {
    const base = { ALL: pagination.total, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    hotels.forEach((hotel) => {
      base[hotel.status as 'PENDING' | 'APPROVED' | 'REJECTED'] += 1;
    });
    return base;
  }, [hotels, pagination.total]);

  const refreshList = () =>
    dispatch(
      fetchHotels({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      }) as any
    );

  const handleApprove = async (id: string) => {
    if (window.confirm('Approve this hotel listing?')) {
      await dispatch(approveHotel({ id }) as any);
      refreshList();
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      await dispatch(rejectHotel({ id, reason: reason || undefined }) as any);
      refreshList();
    }
  };

  if (loading && hotels.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sovereign-panel p-8 text-center">
        <h3 className="font-headline text-2xl font-bold text-[var(--text)]">
          Failed to load hotel approvals
        </h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="sovereign-label">Hotel moderation</div>
          <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[var(--text)]">
            Review hospitality inventory with clean evidence hierarchy
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            Moderate hotel submissions, inspect amenities and imagery, and keep the stay catalog
            aligned with platform standards.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-low)] p-1.5">
        {[
          { value: '', label: 'All Hotels', count: tabCounts.ALL },
          { value: 'PENDING', label: 'Pending', count: tabCounts.PENDING },
          { value: 'APPROVED', label: 'Approved', count: tabCounts.APPROVED },
          { value: 'REJECTED', label: 'Rejected', count: tabCounts.REJECTED },
        ].map((tab) => {
          const active = statusFilter === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`sovereign-tab ${active ? 'sovereign-tab-active' : 'sovereign-tab-idle'}`}
            >
              {tab.label}
              <span className="rounded-full bg-[var(--surface-high)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                {tab.count}
              </span>
            </button>
          );
        })}
      </section>

      <section>
        <div className="space-y-5">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-soft)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search hotels, agencies, or locations..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="sovereign-input pl-11"
            />
          </div>

          <div className="sovereign-table-shell overflow-x-auto">
            <table className="sovereign-table min-w-full">
              <thead>
                <tr>
                  <th>Hotel</th>
                  <th>Agency</th>
                  <th>Location</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => {
                  const active = hotel.id === selectedHotelId;
                  return (
                    <tr
                      key={hotel.id}
                      onClick={() => {
                        setSelectedHotelId(hotel.id);
                        setIsDetailOpen(true);
                      }}
                      className={`cursor-pointer transition-colors ${active ? 'bg-[var(--surface-low)]' : ''}`}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[var(--secondary-container)] font-semibold text-[var(--text)]">
                            {getInitials(hotel.name, 'HT')}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text)]">{hotel.name}</div>
                            <div className="text-xs text-[var(--text-soft)]">
                              {hotel.rating ? `${hotel.rating} stars` : 'Unrated'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-[var(--text)]">{hotel.agencyName || 'Independent'}</div>
                        <div className="mt-1 text-xs text-[var(--text-soft)]">
                          {hotel.roomsCount ?? 0} rooms
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-[var(--text)]">{hotel.city}</div>
                        <div className="mt-1 text-xs text-[var(--text-soft)]">{hotel.country}</div>
                      </td>
                      <td>{formatDate(hotel.createdAt)}</td>
                      <td>
                        <span className={statusClassMap[hotel.status] || 'sovereign-pill sovereign-pill-neutral'}>
                          {hotel.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button type="button" className="sovereign-button-secondary h-10 px-4">
                          {hotel.status === 'PENDING' ? 'Review' : 'Inspect'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
              <p className="text-sm text-[var(--text-muted)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="sovereign-button-secondary h-11 px-4 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages}
                  className="sovereign-button-secondary h-11 px-4 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <EntityDetailModal
        open={isDetailOpen && Boolean(selectedHotel)}
        title={selectedHotel?.name || 'Hotel details'}
        subtitle={selectedHotel?.agencyName || 'Independent Hotel'}
        onClose={() => setIsDetailOpen(false)}
      >
        {selectedHotel ? (
          <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="sovereign-label">Hotel review</div>
                  <h3 className="mt-2 font-headline text-2xl font-bold tracking-tight text-[var(--text)]">
                    {selectedHotel.name}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{selectedHotel.agencyName || 'Independent Hotel'}</p>
                </div>
                <span className={statusClassMap[selectedHotel.status] || 'sovereign-pill sovereign-pill-neutral'}>
                  {selectedHotel.status}
                </span>
              </div>

              {selectedHotel.images[0] ? (
                <img
                  src={selectedHotel.images[0]}
                  alt={selectedHotel.name}
                  className="mt-5 h-48 w-full rounded-[22px] object-cover"
                />
              ) : (
                <div className="mt-5 flex h-48 items-center justify-center rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--surface-low)] text-[var(--text-soft)]">
                  No preview image available
                </div>
              )}

              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
                <div className="sovereign-label">Property details</div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Address</span>
                    <span className="max-w-[55%] text-right font-semibold text-[var(--text)]">
                      {selectedHotel.address}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">City</span>
                    <span className="font-semibold text-[var(--text)]">{selectedHotel.city}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Country</span>
                    <span className="font-semibold text-[var(--text)]">{selectedHotel.country}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Email</span>
                    <span className="font-semibold text-[var(--text)]">{selectedHotel.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Phone</span>
                    <span className="font-semibold text-[var(--text)]">{selectedHotel.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Rooms</span>
                    <span className="font-semibold text-[var(--text)]">
                      {selectedHotel.roomsCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
                <div className="sovereign-label">Verification documents</div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">Business doc</span>
                    {selectedHotel.businessDocUrl ? (
                      <a
                        href={selectedHotel.businessDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 transition-colors hover:border-[var(--primary)]"
                      >
                        <div className="flex h-20 items-center justify-center">
                          <svg
                            className="h-8 w-8 text-[var(--primary)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <span className="mt-1 block text-center text-[10px] font-medium text-[var(--text-soft)]">
                          View doc
                        </span>
                      </a>
                    ) : (
                      <div className="mt-2 flex h-24 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-high)] text-[10px] text-[var(--text-muted)]">
                        No doc provided
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">Location Image</span>
                    {selectedHotel.locationImageUrl ? (
                      <a
                        href={selectedHotel.locationImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 transition-colors hover:border-[var(--primary)]"
                      >
                        <img
                          src={selectedHotel.locationImageUrl}
                          alt="Location"
                          className="h-20 w-full rounded-lg object-cover"
                        />
                        <span className="mt-1 block text-center text-[10px] font-medium text-[var(--text-soft)]">
                          View image
                        </span>
                      </a>
                    ) : (
                      <div className="mt-2 flex h-24 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-high)] text-[10px] text-[var(--text-muted)]">
                        No image provided
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedHotel.description && (
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
                  <div className="sovereign-label">Description</div>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                    {selectedHotel.description}
                  </p>
                </div>
              )}

              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
                <div className="sovereign-label">Amenities</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedHotel.amenities.length > 0 ? (
                    selectedHotel.amenities.map((amenity) => (
                      <span key={amenity} className="sovereign-pill sovereign-pill-neutral">
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[var(--text-soft)]">
                      No amenities were attached to this listing.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
                {selectedHotel.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedHotel.id)}
                    className="sovereign-button-primary h-12 px-5"
                  >
                    Approve Hotel
                  </button>
                )}
                {selectedHotel.status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => handleReject(selectedHotel.id)}
                    className="sovereign-button-danger h-12 px-5"
                  >
                    Reject Hotel
                  </button>
                )}
              </div>
          </div>
        ) : null}
      </EntityDetailModal>
    </div>
  );
};

export default HotelApprovalList;
