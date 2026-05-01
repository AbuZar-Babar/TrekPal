import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import ManagementPageShell from '../../../shared/components/management/ManagementPageShell';
import EntityDetailModal from '../../../shared/components/management/EntityDetailModal';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { useHotels } from '../../hotels/hooks/useHotels';
import { useVehicles } from '../../vehicles/hooks/useVehicles';

const statusClassMap: Record<string, string> = {
  PENDING: 'sovereign-pill sovereign-pill-warning',
  APPROVED: 'sovereign-pill sovereign-pill-success',
  REJECTED: 'sovereign-pill sovereign-pill-danger',
};

const InventoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') === 'vehicles' ? 'vehicles' : 'hotels';

  const {
    hotels,
    loading: hotelsLoading,
    error: hotelsError,
    pagination: hotelsPagination,
    loadHotels,
  } = useHotels();
  const {
    vehicles,
    loading: vehiclesLoading,
    error: vehiclesError,
    pagination: vehiclesPagination,
    loadVehicles,
  } = useVehicles();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (type === 'hotels') {
      loadHotels({ page, limit: 20, search: search || undefined });
      return;
    }

    loadVehicles({ page, limit: 20, search: search || undefined });
  }, [loadHotels, loadVehicles, page, search, type]);

  const activeItems = type === 'hotels' ? hotels : vehicles;
  const loading = type === 'hotels' ? hotelsLoading : vehiclesLoading;
  const error = type === 'hotels' ? hotelsError : vehiclesError;
  const pagination = type === 'hotels' ? hotelsPagination : vehiclesPagination;

  useEffect(() => {
    if (selectedId && !activeItems.some((item) => item.id === selectedId)) {
      setSelectedId(null);
      setIsDetailOpen(false);
    }
  }, [activeItems, selectedId]);

  const selectedItem = useMemo(
    () => activeItems.find((item) => item.id === selectedId) ?? null,
    [activeItems, selectedId],
  );
  const selectedHotel = type === 'hotels' ? hotels.find((hotel) => hotel.id === selectedId) ?? null : null;
  const selectedVehicle =
    type === 'vehicles' ? vehicles.find((vehicle) => vehicle.id === selectedId) ?? null : null;

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  const switchType = (nextType: 'hotels' | 'vehicles') => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('type', nextType);
    setSearchParams(nextParams);
    setPage(1);
    setSelectedId(null);
  };

  const filters = (
    <div className="flex flex-wrap gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-low)] p-1.5">
      {[
        { value: 'hotels', label: 'Hotels' },
        { value: 'vehicles', label: 'Vehicles' },
      ].map((tab) => {
        const active = type === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => switchType(tab.value as 'hotels' | 'vehicles')}
            className={`sovereign-tab ${active ? 'sovereign-tab-active' : 'sovereign-tab-idle'}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  const list = (
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
          placeholder={`Search ${type}...`}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="sovereign-input pl-11"
        />
      </div>

      {loading && activeItems.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
        </div>
      ) : error ? (
        <div className="sovereign-panel p-8 text-center">
          <h3 className="font-headline text-2xl font-bold text-[var(--text)]">
            Failed to load inventory
          </h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
        </div>
      ) : (
        <>
          <div className="sovereign-table-shell overflow-x-auto">
            <table className="sovereign-table min-w-full">
              <thead>
                <tr>
                  <th>{type === 'hotels' ? 'Hotel' : 'Vehicle'}</th>
                  <th>Agency</th>
                  <th>{type === 'hotels' ? 'Location' : 'Details'}</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {type === 'hotels'
                  ? hotels.map((hotel) => {
                      const active = hotel.id === selectedId;
                      return (
                        <tr
                          key={hotel.id}
                          onClick={() => {
                            setSelectedId(hotel.id);
                            setIsDetailOpen(true);
                          }}
                          className={`cursor-pointer transition-colors ${active ? 'bg-[var(--surface-low)]' : ''}`}
                        >
                          <td>
                            <div className="font-semibold text-[var(--text)]">{hotel.name}</div>
                            <div className="text-xs text-[var(--text-soft)]">
                              {hotel.roomsCount || 0} rooms
                            </div>
                          </td>
                          <td>{hotel.agencyName}</td>
                          <td>
                            {hotel.city}, {hotel.country}
                          </td>
                          <td>
                            <span className={statusClassMap[hotel.status] || 'sovereign-pill sovereign-pill-neutral'}>
                              {hotel.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  : vehicles.map((vehicle) => {
                      const active = vehicle.id === selectedId;
                      return (
                        <tr
                          key={vehicle.id}
                          onClick={() => {
                            setSelectedId(vehicle.id);
                            setIsDetailOpen(true);
                          }}
                          className={`cursor-pointer transition-colors ${active ? 'bg-[var(--surface-low)]' : ''}`}
                        >
                          <td>
                            <div className="font-semibold text-[var(--text)]">
                              {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-xs text-[var(--text-soft)]">{vehicle.year}</div>
                          </td>
                          <td>{vehicle.agencyName}</td>
                          <td>
                            {vehicle.type} • {vehicle.capacity} seats
                          </td>
                          <td>
                            <span className={statusClassMap[vehicle.status] || 'sovereign-pill sovereign-pill-neutral'}>
                              {vehicle.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {activeItems.length === 0 ? (
            <div className="sovereign-panel p-10 text-center">
              <h3 className="font-headline text-2xl font-bold text-[var(--text)]">No items found</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Try a different search.</p>
            </div>
          ) : null}

          {pagination.total > pagination.limit ? (
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
          ) : null}
        </>
      )}
    </div>
  );

  const detailContent = selectedItem ? (
    <div className="space-y-5">
      {selectedHotel ? (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="sovereign-label">Hotel</div>
              <h3 className="mt-2 font-headline text-2xl font-bold text-[var(--text)]">
                {selectedHotel.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{selectedHotel.agencyName}</p>
            </div>
            <span className={statusClassMap[selectedHotel.status] || 'sovereign-pill sovereign-pill-neutral'}>
              {selectedHotel.status}
            </span>
          </div>

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--text-soft)]">City</span>
                <span className="font-semibold text-[var(--text)]">
                  {selectedHotel.city}, {selectedHotel.country}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--text-soft)]">Rating</span>
                <span className="font-semibold text-[var(--text)]">{selectedHotel.rating || 'Not rated'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--text-soft)]">Rooms</span>
                <span className="font-semibold text-[var(--text)]">{selectedHotel.roomsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--text-soft)]">Created</span>
                <span className="font-semibold text-[var(--text)]">{formatDate(selectedHotel.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
            <div className="sovereign-label">Address</div>
            <p className="mt-3 text-sm text-[var(--text-muted)]">{selectedHotel.address}</p>
          </div>

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
            <div className="sovereign-label">Amenities</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedHotel.amenities.length > 0 ? (
                selectedHotel.amenities.map((item: string) => (
                  <span key={item} className="sovereign-pill sovereign-pill-neutral">
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--text-soft)]">No amenities listed</span>
              )}
            </div>
          </div>

          {selectedHotel.images.length > 0 ? (
            <div>
              <div className="sovereign-label">Images</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {selectedHotel.images.map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={selectedHotel.name}
                    className="h-28 w-full rounded-[18px] border border-[var(--border)] object-cover"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="sovereign-label">Vehicle</div>
              <h3 className="mt-2 font-headline text-2xl font-bold text-[var(--text)]">
                {selectedVehicle?.make} {selectedVehicle?.model}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{selectedVehicle?.agencyName}</p>
            </div>
            <span className={statusClassMap[selectedVehicle?.status || ''] || 'sovereign-pill sovereign-pill-neutral'}>
              {selectedVehicle?.status}
            </span>
          </div>

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--text-soft)]">Type</span>
                <span className="font-semibold text-[var(--text)]">{selectedVehicle?.type}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--text-soft)]">Year</span>
                <span className="font-semibold text-[var(--text)]">{selectedVehicle?.year}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--text-soft)]">Capacity</span>
                <span className="font-semibold text-[var(--text)]">{selectedVehicle?.capacity} seats</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--text-soft)]">Price / day</span>
                <span className="font-semibold text-[var(--text)]">
                  {formatCurrency(selectedVehicle?.pricePerDay)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--text-soft)]">Availability</span>
                <span className="font-semibold text-[var(--text)]">
                  {selectedVehicle?.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--text-soft)]">Created</span>
                <span className="font-semibold text-[var(--text)]">{formatDate(selectedVehicle?.createdAt)}</span>
              </div>
            </div>
          </div>

          {selectedVehicle && selectedVehicle.images.length > 0 ? (
            <div>
              <div className="sovereign-label">Images</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {selectedVehicle.images.map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                    className="h-28 w-full rounded-[18px] border border-[var(--border)] object-cover"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  ) : null;

  return (
    <>
      <ManagementPageShell
        filters={filters}
        list={list}
      />
      <EntityDetailModal
        open={isDetailOpen && Boolean(selectedItem)}
        title={
          selectedHotel
            ? selectedHotel.name
            : `${selectedVehicle?.make || ''} ${selectedVehicle?.model || ''}`.trim() || 'Inventory item details'
        }
        subtitle={selectedHotel?.agencyName || selectedVehicle?.agencyName || undefined}
        onClose={() => setIsDetailOpen(false)}
      >
        {detailContent}
      </EntityDetailModal>
    </>
  );
};

export default InventoryPage;
