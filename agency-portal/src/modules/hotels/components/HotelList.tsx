import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '../../../store';
import { formatDate } from '../../../shared/utils/formatters';
import { deleteHotel, fetchHotels } from '../store/hotelsSlice';

const HotelList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hotels, loading, error } = useSelector((state: RootState) => state.hotels);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchHotels({ limit: 100 }) as any);
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      await dispatch(deleteHotel(id) as any);
    }
  };

  const filtered = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = [
    { label: 'All hotels', value: hotels.length },
    { label: 'With amenities', value: hotels.filter((hotel) => hotel.amenities.length > 0).length },
    { label: 'With images', value: hotels.filter((hotel) => hotel.images.length > 0).length },
    { label: 'Cities covered', value: new Set(hotels.map((hotel) => hotel.city)).size },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.16fr,0.84fr]">
        <div className="app-card px-6 py-6 md:px-8 md:py-8">
          <div className="app-section-label">Hotels</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Stay inventory ready for commercial packaging</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            Keep hotel listings current so the marketplace team can package offers with realistic stay coverage, location context, and property amenities without waiting on admin verification.
          </p>
        </div>

        <div className="app-panel-dark px-6 py-6">
          <div className="app-section-label text-white/55">Inventory pulse</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Hotel inventory overview</h2>
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
              placeholder="Search hotels by name or city..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="app-field pl-11"
            />
            <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            type="button"
            onClick={() => navigate('/hotels/new')}
            className="app-btn-primary h-11 px-5 text-sm"
          >
            Add hotel
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="app-table-shell px-6 py-14 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Loading hotels...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="app-table-shell px-6 py-14 text-center">
          <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
            {searchQuery ? 'No hotels match the current search' : 'No hotels listed yet'}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            {searchQuery
              ? 'Adjust the search query to widen the result set.'
              : 'Create your first property listing to start packaging stay-inclusive offers.'}
          </p>
        </div>
      ) : (
        <div className="app-table-shell overflow-x-auto">
          <table className="app-table min-w-[1100px]">
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Amenities</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hotel) => (
                <tr key={hotel.id}>
                  <td>
                    <div className="font-semibold tracking-tight text-[var(--text)]">{hotel.name}</div>
                    {hotel.description && (
                      <div className="mt-1 text-sm leading-7 text-[var(--text-muted)]">{hotel.description}</div>
                    )}
                  </td>
                  <td>
                    <div className="font-semibold tracking-tight text-[var(--text)]">{hotel.city}, {hotel.country}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">{hotel.address}</div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="app-pill app-pill-neutral">{amenity}</span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="app-pill app-pill-neutral">+{hotel.amenities.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(hotel.updatedAt)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/hotels/${hotel.id}/edit`)}
                        className="app-btn-secondary h-10 px-4 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(hotel.id)}
                        className="app-btn-secondary h-10 px-4 text-sm text-[var(--danger-text)]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HotelList;
