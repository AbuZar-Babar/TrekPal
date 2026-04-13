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
      hotel.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.country?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = [
    { label: 'Properties', value: hotels.length, hint: 'Total hotel listings in inventory' },
    {
      label: 'Amenity rich',
      value: hotels.filter((hotel) => hotel.amenities.length >= 4).length,
      hint: 'Listings with stronger stay detail',
    },
    {
      label: 'Visual ready',
      value: hotels.filter((hotel) => hotel.images.length > 0).length,
      hint: 'Properties with at least one image',
    },
    {
      label: 'Cities',
      value: new Set(hotels.map((hotel) => hotel.city).filter(Boolean)).size,
      hint: 'Destination coverage across listings',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <div className="space-y-3">
          <span className="app-pill app-pill-neutral">Hotels</span>
          <h1 className="page-title">Clean stay inventory for offer packaging</h1>
          <p className="page-copy max-w-3xl">
            Keep hotel listings current so your agency can attach credible stay options to every
            offer without switching tools or asking admin for manual cleanup.
          </p>
        </div>
        <div className="page-stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <p>{stat.hint}</p>
            </article>
          ))}
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
              placeholder="Search by hotel, city, or country"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="border-0 bg-transparent p-0 text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-0"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/hotels/new')}
            className="app-btn-primary h-11 px-5 text-sm"
          >
            Add hotel
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="surface px-6 py-14 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Loading hotels...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface px-6 py-14 text-center">
          <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
            {searchQuery ? 'No hotels match the current search' : 'No hotels listed yet'}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            {searchQuery
              ? 'Adjust the search terms to widen the result set.'
              : 'Create your first property listing to start packaging stay-inclusive offers.'}
          </p>
        </div>
      ) : (
        <>
          <div className="mobile-record-list lg:hidden">
            {filtered.map((hotel) => (
              <article key={hotel.id} className="record-card">
                <div className="record-grid">
                  <div>
                    <div className="text-base font-semibold tracking-tight text-[var(--text)]">
                      {hotel.name}
                    </div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">
                      {hotel.city}, {hotel.country}
                    </div>
                  </div>
                  <div className="text-right text-xs text-[var(--text-soft)]">
                    Updated {formatDate(hotel.updatedAt)}
                  </div>
                </div>

                {hotel.description && (
                  <p className="text-sm leading-6 text-[var(--text-muted)]">{hotel.description}</p>
                )}

                <div className="space-y-2 text-sm text-[var(--text-muted)]">
                  <div>{hotel.address}</div>
                  <div>{hotel.images.length} image{hotel.images.length === 1 ? '' : 's'} attached</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.slice(0, 4).map((amenity) => (
                    <span key={amenity} className="app-pill app-pill-neutral">
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 4 && (
                    <span className="app-pill app-pill-neutral">+{hotel.amenities.length - 4}</span>
                  )}
                </div>

                <div className="record-actions">
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
              </article>
            ))}
          </div>

          <div className="surface hidden overflow-x-auto lg:block">
            <table className="app-table min-w-[1100px]">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Amenities</th>
                  <th>Images</th>
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
                        <div className="mt-1 text-sm leading-7 text-[var(--text-muted)]">
                          {hotel.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">
                        {hotel.city}, {hotel.country}
                      </div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">{hotel.address}</div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.slice(0, 4).map((amenity) => (
                          <span key={amenity} className="app-pill app-pill-neutral">
                            {amenity}
                          </span>
                        ))}
                        {hotel.amenities.length > 4 && (
                          <span className="app-pill app-pill-neutral">+{hotel.amenities.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td>{hotel.images.length}</td>
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
        </>
      )}
    </div>
  );
};

export default HotelList;
