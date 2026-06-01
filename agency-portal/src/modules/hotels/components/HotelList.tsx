import { useEffect, useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../store';
import { Hotel, Vehicle } from '../../../shared/types';
import { transportService } from '../../transport/services/transportService';
import { fetchHotels } from '../store/hotelsSlice';

const HotelList = () => {
  const dispatch = useDispatch();
  const { hotels, loading, error } = useSelector((state: RootState) => state.hotels);
  const [activeTab, setActiveTab] = useState<'hotels' | 'vehicles'>('hotels');
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    dispatch(fetchHotels({ limit: 100, discovery: true }) as any);
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    setVehiclesLoading(true);
    setVehiclesError(null);

    transportService
      .getMarketplaceVehicles({ limit: 100, status: 'APPROVED' })
      .then((result) => {
        if (!mounted) return;
        const available = result.data.filter((v) => v.isAvailable && v.status === 'APPROVED');
        setVehicles(available);
      })
      .catch((err: any) => {
        if (!mounted) return;
        setVehiclesError(err.message || 'Failed to load vehicles');
      })
      .finally(() => {
        if (mounted) setVehiclesLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const filteredHotels = hotels.filter((h) => {
    const q = searchQuery.toLowerCase();
    return h.name.toLowerCase().includes(q) || h.city?.toLowerCase().includes(q) || h.country?.toLowerCase().includes(q);
  });

  const filteredVehicles = vehicles.filter((v) => {
    const q = vehicleSearchQuery.toLowerCase();
    return `${v.make} ${v.model} ${v.type}`.toLowerCase().includes(q);
  });

  const getAvailableRooms = (h: Hotel) => {
    const rooms = h.rooms || [];
    if (!rooms.length) return { roomTypes: 0, available: 0 };
    const available = rooms.reduce((s, r) => s + (r.availableQuantity ?? r.quantity ?? 0), 0);
    return { roomTypes: rooms.length, available };
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Marketplace</h1>
        <p className="mt-0.5 text-sm text-[var(--text-soft)]">Browse available hotels and vehicles for your trips</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { label: 'Hotels', value: 'hotels' },
          { label: 'Vehicles', value: 'vehicles' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value as any)}
            className={`h-8 rounded-lg px-3.5 text-xs font-semibold transition-colors ${
              activeTab === tab.value
                ? 'bg-[var(--primary)] text-white'
                : 'border border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 text-sm max-w-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-[var(--text-soft)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={activeTab === 'hotels' ? 'Search hotels, cities…' : 'Search make, model, type…'}
          value={activeTab === 'hotels' ? searchQuery : vehicleSearchQuery}
          onChange={(e) => activeTab === 'hotels' ? setSearchQuery(e.target.value) : setVehicleSearchQuery(e.target.value)}
          className="flex-1 border-0 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none"
        />
      </div>

      {/* Error messages */}
      {activeTab === 'hotels' && error && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}
      {activeTab === 'vehicles' && vehiclesError && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {vehiclesError}
        </div>
      )}

      {/* Content */}
      {activeTab === 'hotels' ? (
        loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[var(--text-soft)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7h14v14M9 11h2m2 0h2M9 15h2m2 0h2" />
            </svg>
            <p className="text-sm text-[var(--text-soft)]">No hotels found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHotels.map((h) => {
              const avail = getAvailableRooms(h);
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setSelectedHotel(h)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden text-left transition-colors hover:border-[var(--primary)]"
                >
                  {h.images?.[0] ? (
                    <img src={h.images[0]} alt="" className="h-40 w-full object-cover" />
                  ) : (
                    <div className="h-40 w-full bg-[var(--panel-subtle)] flex items-center justify-center text-xs text-[var(--text-soft)]">No image</div>
                  )}
                  <div className="p-4">
                    <div className="font-semibold text-[var(--text)]">{h.name}</div>
                    <div className="text-xs text-[var(--text-soft)] mt-0.5">{h.city}, {h.country}</div>
                    {h.rating && (
                      <div className="text-xs mt-1 text-[var(--warning-text)]">★ {h.rating}</div>
                    )}
                    <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                      {avail.roomTypes} room types · {avail.available} available
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )
      ) : vehiclesLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[var(--text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-[var(--text-soft)]">No vehicles found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVehicle(v)}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden text-left transition-colors hover:border-[var(--primary)]"
            >
              {v.images?.[0] ? (
                <img src={v.images[0]} alt="" className="h-40 w-full object-cover" />
              ) : (
                <div className="h-40 w-full bg-[var(--panel-subtle)] flex items-center justify-center text-xs text-[var(--text-soft)]">No image</div>
              )}
              <div className="p-4">
                <div className="font-semibold text-[var(--text)]">{v.make} {v.model}</div>
                <div className="text-xs text-[var(--text-soft)] mt-0.5">{v.type}</div>
                <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                  {v.capacity} seats · {v.year}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hotel detail modal */}
      {selectedHotel && (
        <HotelDetailModal hotel={selectedHotel} onClose={() => setSelectedHotel(null)} />
      )}

      {/* Vehicle detail modal */}
      {selectedVehicle && (
        <VehicleDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      )}
    </div>
  );
};

// Hotel detail modal
const HotelDetailModal = ({ hotel, onClose }: { hotel: Hotel; onClose: () => void }) => {
  useLayoutEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[var(--panel)] shadow-2xl" style={{ maxHeight: '90vh' }}>
        <div className="shrink-0 flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text)]">{hotel.name}</h3>
            <p className="text-xs text-[var(--text-soft)]">{hotel.city}, {hotel.country}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {hotel.images?.[0] && (
            <img src={hotel.images[0]} alt="" className="h-40 w-full rounded-lg object-cover" />
          )}

          {hotel.rating && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Rating</div>
              <div className="text-sm font-semibold text-[var(--text)] mt-1">★ {hotel.rating} / 5</div>
            </div>
          )}

          {hotel.description && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">About</div>
              <p className="text-sm text-[var(--text-muted)] mt-2">{hotel.description}</p>
            </div>
          )}

          {(hotel.amenities || []).length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Amenities</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {hotel.amenities.map((a) => (
                  <span key={a} className="rounded-full border border-[var(--border)] bg-[var(--panel-subtle)] px-2.5 py-0.5 text-xs text-[var(--text-muted)]">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(hotel.rooms || []).length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Rooms</div>
              <div className="grid gap-2 mt-2">
                {(hotel.rooms || []).map((r) => (
                  <div key={r.id} className="rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-[var(--text)]">{r.type}</div>
                      <div className="text-[10px] text-[var(--text-soft)]">{r.availableQuantity ?? r.quantity ?? 0} available</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Vehicle detail modal
const VehicleDetailModal = ({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) => {
  useLayoutEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[var(--panel)] shadow-2xl" style={{ maxHeight: '90vh' }}>
        <div className="shrink-0 flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text)]">{vehicle.make} {vehicle.model}</h3>
            <p className="text-xs text-[var(--text-soft)]">{vehicle.type}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {vehicle.images?.[0] && (
            <img src={vehicle.images[0]} alt="" className="h-40 w-full rounded-lg object-cover" />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Capacity</div>
              <div className="text-xs font-semibold text-[var(--text)] mt-1">{vehicle.capacity} seats</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Year</div>
              <div className="text-xs font-semibold text-[var(--text)] mt-1">{vehicle.year}</div>
            </div>
            {vehicle.vehicleNumber && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Registration</div>
                <div className="text-xs font-semibold text-[var(--text)] mt-1">{vehicle.vehicleNumber}</div>
              </div>
            )}
            {vehicle.driverName && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Driver</div>
                <div className="text-xs font-semibold text-[var(--text)] mt-1">{vehicle.driverName}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelList;
