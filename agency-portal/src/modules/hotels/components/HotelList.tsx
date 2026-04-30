import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../store';
import { fetchHotels } from '../store/hotelsSlice';
import { Hotel } from '../../../shared/types';

const HotelList = () => {
  const dispatch = useDispatch();
  const { hotels, loading, error } = useSelector((state: RootState) => state.hotels);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    dispatch(fetchHotels({
      limit: 100,
      discovery: true,
    }) as any);
  }, [dispatch]);

  const filtered = hotels.filter((hotel) => {
    const query = searchQuery.toLowerCase();
    return (
      hotel.name.toLowerCase().includes(query) ||
      hotel.city?.toLowerCase().includes(query) ||
      hotel.country?.toLowerCase().includes(query)
    );
  });

  const getAvailabilitySummary = (hotel: any) => {
    const rooms = hotel.rooms || [];
    if (!rooms.length) {
      return { roomTypes: 0, availableUnits: 0 };
    }

    const availableUnits = rooms.reduce(
      (sum: number, room: any) => sum + (room.availableQuantity ?? room.quantity ?? 0),
      0
    );

    return {
      roomTypes: rooms.length,
      availableUnits,
    };
  };

  return (
    <div className="space-y-6">
      <section className="section-title-row">
        <h2 className="section-title">Hotels</h2>
      </section>

      <section className="surface">
        <div className="page-toolbar">
          <div className="search-shell">
            <svg className="h-5 w-5 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Filter by hotel, city, or country"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent p-0 text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-0"
            />
          </div>

        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="surface px-6 py-14 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Fetching properties...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface px-6 py-14 text-center">
          <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
            No properties in marketplace
          </div>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Independent hotels will appear here once they are approved.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((hotel) => (
            (() => {
              const availability = getAvailabilitySummary(hotel);
              return (
            <article key={hotel.id} className="surface flex flex-col overflow-hidden">
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
                  {hotel.rating && (
                    <div className="flex items-center gap-1 rounded-lg bg-[var(--panel-subtle)] px-2 py-1 text-xs font-bold text-[var(--text)]">
                      <span>*</span>
                      <span>{hotel.rating}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {hotel.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity} className="rounded-md bg-[var(--panel-subtle)] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--text-soft)]">
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 3 && (
                    <span className="text-[10px] text-[var(--text-muted)]">+{hotel.amenities.length - 3} more</span>
                  )}
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between">
                  <div className="text-xs text-[var(--text-muted)]">
                    <div>{availability.roomTypes} room types</div>
                    <div className="font-semibold text-[var(--text)]">
                      {availability.availableUnits} units available
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
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
              </div>
            </article>
              );
            })()
          ))}
        </div>
      )}

      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="surface max-h-[90vh] w-full max-w-3xl overflow-y-auto">
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
              {selectedHotel.images?.[0] && (
                <img
                  src={selectedHotel.images[0]}
                  alt={selectedHotel.name}
                  className="h-56 w-full rounded-[18px] object-cover"
                />
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-[var(--panel-subtle)] px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Address</div>
                  <div className="mt-1 text-sm font-medium text-[var(--text)]">{selectedHotel.address}</div>
                </div>
                <div className="rounded-xl bg-[var(--panel-subtle)] px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Rating</div>
                  <div className="mt-1 text-sm font-medium text-[var(--text)]">
                    {selectedHotel.rating ? `${selectedHotel.rating} / 5` : 'Unrated'}
                  </div>
                </div>
              </div>

              {selectedHotel.description && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Description</div>
                  <p className="mt-1 text-sm leading-7 text-[var(--text-muted)]">{selectedHotel.description}</p>
                </div>
              )}

              <div>
                <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Hotel Services</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selectedHotel.services || []).length > 0 ? (
                    (selectedHotel.services ?? []).map((service) => (
                      <span
                        key={service.id}
                        className="rounded-md bg-[var(--panel-subtle)] px-2 py-1 text-xs font-semibold text-[var(--text)]"
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
                      <div key={room.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelList;

