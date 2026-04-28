import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '../../../store';
import { fetchHotels } from '../store/hotelsSlice';

const HotelList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hotels, loading, error } = useSelector((state: RootState) => state.hotels);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-[var(--text)]">Hotels</h2>
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
              
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text)]">{hotel.name}</h3>
                    <p className="text-sm text-[var(--text-soft)]">{hotel.city}, {hotel.country}</p>
                  </div>
                  {hotel.rating && (
                    <div className="flex items-center gap-1 rounded-lg bg-[var(--panel-subtle)] px-2 py-1 text-xs font-bold text-[var(--text)]">
                      <span>★</span>
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
                  <div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/hotels/${hotel.id}`)}
                      className="app-btn-secondary h-9 px-4 text-xs"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelList;
