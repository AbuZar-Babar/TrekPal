import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../store';
import { Hotel, Vehicle } from '../../../shared/types';
import {
  PortalListItemTransition,
  PortalModalTransition,
  PortalPageTransition,
} from '../../../shared/components/motion/portalMotion';
import { transportService } from '../../transport/services/transportService';
import { fetchHotels } from '../store/hotelsSlice';

const HotelList = () => {
  const dispatch = useDispatch();
  const { hotels, loading, error } = useSelector((state: RootState) => state.hotels);
  const [activeTab, setActiveTab] = useState<'hotels' | 'vehicles'>('hotels');
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    dispatch(fetchHotels({
      limit: 100,
      discovery: true,
    }) as any);
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    setVehiclesLoading(true);
    setVehiclesError(null);

    transportService
      .getMarketplaceVehicles({ limit: 100, status: 'APPROVED' })
      .then((result) => {
        if (!mounted) {
          return;
        }

        const available = result.data.filter((vehicle) => vehicle.isAvailable && vehicle.status === 'APPROVED');
        setVehicles(available);
      })
      .catch((err: any) => {
        if (!mounted) {
          return;
        }
        setVehiclesError(err.message || 'Failed to load marketplace vehicles');
      })
      .finally(() => {
        if (mounted) {
          setVehiclesLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredHotels = hotels.filter((hotel) => {
    const query = searchQuery.toLowerCase();
    return (
      hotel.name.toLowerCase().includes(query) ||
      hotel.city?.toLowerCase().includes(query) ||
      hotel.country?.toLowerCase().includes(query)
    );
  });

  const filteredVehicles = vehicles.filter((vehicle) => {
    const query = vehicleSearchQuery.toLowerCase();
    return (
      `${vehicle.make} ${vehicle.model} ${vehicle.type} ${vehicle.vehicleNumber || ''}`
        .toLowerCase()
        .includes(query)
    );
  });

  const getAvailabilitySummary = (hotel: Hotel) => {
    const rooms = hotel.rooms || [];
    if (!rooms.length) {
      return { roomTypes: 0, availableUnits: 0 };
    }

    const availableUnits = rooms.reduce(
      (sum, room) => sum + (room.availableQuantity ?? room.quantity ?? 0),
      0,
    );

    return {
      roomTypes: rooms.length,
      availableUnits,
    };
  };

  const renderHotels = () => {
    if (loading) {
      return (
        <div className="surface px-6 py-14 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Fetching properties...</p>
        </div>
      );
    }

    if (filteredHotels.length === 0) {
      return (
        <div className="surface px-6 py-14 text-center">
          <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
            No properties in marketplace
          </div>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Independent hotels will appear here once they are approved.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredHotels.map((hotel, index) => {
          const availability = getAvailabilitySummary(hotel);

          return (
            <PortalListItemTransition
              key={hotel.id}
              delay={index * 0.03}
              className="surface flex flex-col overflow-hidden"
            >
              <div className="aspect-video w-full bg-[var(--panel-subtle)]">
                {hotel.images?.[0] ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
                    No image
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text)]">{hotel.name}</h3>
                    <p className="text-sm text-[var(--text-soft)]">{hotel.city}, {hotel.country}</p>
                  </div>
                  {hotel.rating ? (
                    <div className="flex items-center gap-1 rounded-[12px] bg-[var(--panel-subtle)] px-2 py-1 text-xs font-bold text-[var(--text)]">
                      <span>*</span>
                      <span>{hotel.rating}</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {hotel.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-[10px] bg-[var(--panel-subtle)] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--text-soft)]"
                    >
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 3 ? (
                    <span className="text-[10px] text-[var(--text-muted)]">+{hotel.amenities.length - 3} more</span>
                  ) : null}
                </div>

                <div className="mt-auto flex items-center justify-between pt-6">
                  <div className="text-xs text-[var(--text-muted)]">
                    <div>{availability.roomTypes} room types</div>
                    <div className="font-semibold text-[var(--text)]">
                      {availability.availableUnits} units available
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setSelectedHotel(hotel);
                    }}
                    className="app-btn-secondary app-btn-sm"
                  >
                    Details
                  </button>
                </div>
              </div>
            </PortalListItemTransition>
          );
        })}
      </div>
    );
  };

  const renderVehicles = () => {
    if (vehiclesLoading) {
      return (
        <div className="surface px-6 py-14 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Fetching available vehicles...</p>
        </div>
      );
    }

    if (filteredVehicles.length === 0) {
      return (
        <div className="surface px-6 py-14 text-center">
          <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
            No available vehicles in marketplace
          </div>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Approved and available vehicles will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredVehicles.map((vehicle, index) => (
          <PortalListItemTransition
            key={vehicle.id}
            delay={index * 0.03}
            className="surface flex flex-col overflow-hidden"
          >
            <div className="aspect-video w-full bg-[var(--panel-subtle)]">
              {vehicle.images?.[0] ? (
                <img
                  src={vehicle.images[0]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
                  No image
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-[var(--text-soft)]">{vehicle.type}</p>
                </div>
                <span className="rounded-[10px] bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Available
                </span>
              </div>

              <div className="mt-4 space-y-1 text-xs text-[var(--text-muted)]">
                <div>Seats: <span className="font-semibold text-[var(--text)]">{vehicle.capacity}</span></div>
                <div>Year: <span className="font-semibold text-[var(--text)]">{vehicle.year}</span></div>
                {vehicle.vehicleNumber ? (
                  <div>Vehicle # <span className="font-semibold text-[var(--text)]">{vehicle.vehicleNumber}</span></div>
                ) : null}
              </div>

              <div className="mt-auto flex items-center justify-end pt-6">
                <button
                  type="button"
                  onClick={() => setSelectedVehicle(vehicle)}
                  className="app-btn-secondary app-btn-sm"
                >
                  Details
                </button>
              </div>
            </div>
          </PortalListItemTransition>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="section-title-row">
        <h2 className="section-title">Marketplace</h2>
      </section>

      <section className="surface p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('hotels')}
            className={`rounded-[12px] px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'hotels'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--panel-subtle)] text-[var(--text-soft)] hover:text-[var(--text)]'
            }`}
          >
            Marketplace Hotels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vehicles')}
            className={`rounded-[12px] px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'vehicles'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--panel-subtle)] text-[var(--text-soft)] hover:text-[var(--text)]'
            }`}
          >
            Available Vehicles
          </button>
        </div>
      </section>

      <section className="surface">
        <div className="page-toolbar">
          <div className="search-shell">
            <svg className="h-5 w-5 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={
                activeTab === 'hotels'
                  ? 'Filter by hotel, city, or country'
                  : 'Filter by make, model, type, or vehicle number'
              }
              value={activeTab === 'hotels' ? searchQuery : vehicleSearchQuery}
              onChange={(event) =>
                activeTab === 'hotels'
                  ? setSearchQuery(event.target.value)
                  : setVehicleSearchQuery(event.target.value)
              }
              className="border-0 bg-transparent p-0 text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </section>

      {activeTab === 'hotels' && error ? (
        <div className="rounded-[16px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      ) : null}
      {activeTab === 'vehicles' && vehiclesError ? (
        <div className="rounded-[16px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {vehiclesError}
        </div>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        <PortalPageTransition key={activeTab}>
          {activeTab === 'hotels' ? renderHotels() : renderVehicles()}
        </PortalPageTransition>
      </AnimatePresence>

      <AnimatePresence>
        {selectedHotel ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              className="absolute inset-0 bg-black/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedHotel(null)}
            />
            <PortalModalTransition className="surface relative max-h-[90vh] w-full max-w-3xl overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--text)]">{selectedHotel.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {selectedHotel.city}, {selectedHotel.country}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHotel(null)}
                  className="app-btn-secondary app-btn-md"
                >
                  Close
                </button>
              </div>

              <div className="space-y-5 px-6 py-5">
                {selectedHotel.images?.[0] ? (
                  <img
                    src={selectedHotel.images[0]}
                    alt={selectedHotel.name}
                    className="h-56 w-full rounded-[16px] object-cover"
                  />
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[14px] bg-[var(--panel-subtle)] px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Address</div>
                    <div className="mt-1 text-sm font-medium text-[var(--text)]">{selectedHotel.address}</div>
                  </div>
                  <div className="rounded-[14px] bg-[var(--panel-subtle)] px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Rating</div>
                    <div className="mt-1 text-sm font-medium text-[var(--text)]">
                      {selectedHotel.rating ? `${selectedHotel.rating} / 5` : 'Unrated'}
                    </div>
                  </div>
                </div>

                {selectedHotel.description ? (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Description</div>
                    <p className="mt-1 text-sm leading-7 text-[var(--text-muted)]">{selectedHotel.description}</p>
                  </div>
                ) : null}

                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Hotel Services</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedHotel.services || []).length > 0 ? (
                      (selectedHotel.services ?? []).map((service) => (
                        <span
                          key={service.id}
                          className="rounded-[10px] bg-[var(--panel-subtle)] px-2 py-1 text-xs font-semibold text-[var(--text)]"
                        >
                          {service.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">No hotel services listed.</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Room Availability</div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {(selectedHotel.rooms || []).length > 0 ? (
                      (selectedHotel.rooms ?? []).map((room: any) => (
                        <div key={room.id} className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-[var(--text)]">{room.type}</div>
                            <div className="text-xs font-semibold text-[var(--text-muted)]">
                              Capacity {room.capacity}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-[var(--text-soft)]">
                            {room.availableQuantity ?? room.quantity ?? 0} units available
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">No room inventory provided yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </PortalModalTransition>
          </div>
        ) : null}

        {selectedVehicle ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              className="absolute inset-0 bg-black/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedVehicle(null)}
            />
            <PortalModalTransition className="surface relative max-h-[90vh] w-full max-w-2xl overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--text)]">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">{selectedVehicle.type}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVehicle(null)}
                  className="app-btn-secondary app-btn-md"
                >
                  Close
                </button>
              </div>

              <div className="space-y-5 px-6 py-5">
                {selectedVehicle.images?.[0] ? (
                  <img
                    src={selectedVehicle.images[0]}
                    alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                    className="h-56 w-full rounded-[16px] object-cover"
                  />
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[14px] bg-[var(--panel-subtle)] px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Capacity</div>
                    <div className="mt-1 text-sm font-medium text-[var(--text)]">{selectedVehicle.capacity} seats</div>
                  </div>
                  <div className="rounded-[14px] bg-[var(--panel-subtle)] px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Model year</div>
                    <div className="mt-1 text-sm font-medium text-[var(--text)]">{selectedVehicle.year}</div>
                  </div>
                  {selectedVehicle.vehicleNumber ? (
                    <div className="rounded-[14px] bg-[var(--panel-subtle)] px-4 py-3">
                      <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Vehicle number</div>
                      <div className="mt-1 text-sm font-medium text-[var(--text)]">{selectedVehicle.vehicleNumber}</div>
                    </div>
                  ) : null}
                  {selectedVehicle.driverName ? (
                    <div className="rounded-[14px] bg-[var(--panel-subtle)] px-4 py-3">
                      <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Driver</div>
                      <div className="mt-1 text-sm font-medium text-[var(--text)]">{selectedVehicle.driverName}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            </PortalModalTransition>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default HotelList;
