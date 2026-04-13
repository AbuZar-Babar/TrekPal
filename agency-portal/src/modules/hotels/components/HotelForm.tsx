import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { createHotel, fetchHotels, updateHotel } from '../store/hotelsSlice';
import { hotelsService } from '../services/hotelsService';
import ImageGalleryInput from '../../../shared/components/forms/ImageGalleryInput';

const AMENITY_OPTIONS = [
  'WiFi',
  'Parking',
  'Pool',
  'Spa',
  'Gym',
  'Restaurant',
  'Room Service',
  'Air Conditioning',
  'Laundry',
  'Bar',
  'Conference Room',
  'Pet Friendly',
  'Airport Shuttle',
  'Beach Access',
];

interface HotelFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  amenities: string[];
  images: string[];
}

const HotelForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchingHotel, setFetchingHotel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<HotelFormData>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: 'Pakistan',
    amenities: [],
    images: [],
  });

  useEffect(() => {
    if (isEditing && id) {
      setFetchingHotel(true);
      hotelsService
        .getHotelById(id)
        .then((hotel) => {
          setForm({
            name: hotel.name,
            description: hotel.description || '',
            address: hotel.address,
            city: hotel.city,
            country: hotel.country,
            amenities: hotel.amenities || [],
            images: hotel.images || [],
          });
        })
        .catch(() => setError('Failed to load hotel details'))
        .finally(() => setFetchingHotel(false));
    }
  }, [id, isEditing]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Hotel name is required');
      return;
    }
    if (!form.address.trim()) {
      setError('Address is required');
      return;
    }
    if (!form.city.trim()) {
      setError('City is required');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && id) {
        await dispatch(updateHotel({ id, data: form }) as any);
      } else {
        await dispatch(createHotel(form) as any);
      }
      await dispatch(fetchHotels({ limit: 100 }) as any);
      navigate('/hotels');
    } catch (err: any) {
      setError(err.message || 'Failed to save hotel');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingHotel) {
    return (
      <div className="surface px-6 py-14 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        <p className="mt-4 text-sm text-[var(--text-muted)]">Loading hotel details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <div className="space-y-3">
          <span className="app-pill app-pill-neutral">{isEditing ? 'Edit hotel' : 'New hotel'}</span>
          <h1 className="page-title">
            {isEditing ? 'Update hotel property details' : 'Create a hotel listing'}
          </h1>
          <p className="page-copy max-w-3xl">
            Keep the listing clean, visual, and searchable so it can be attached to traveler offers
            without extra editing.
          </p>
        </div>
        <div className="page-stats-grid">
          <article className="stat-card">
            <span>City</span>
            <strong>{form.city || '--'}</strong>
            <p>Primary destination coverage for this property.</p>
          </article>
          <article className="stat-card">
            <span>Amenities</span>
            <strong>{form.amenities.length}</strong>
            <p>Features selected for the stay listing.</p>
          </article>
          <article className="stat-card">
            <span>Images</span>
            <strong>{form.images.length}</strong>
            <p>Visual assets attached to the property.</p>
          </article>
          <article className="stat-card">
            <span>Status</span>
            <strong>Live</strong>
            <p>Hotel inventory publishes immediately in the portal.</p>
          </article>
        </div>
      </section>

      {error && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <div className="surface px-6 py-6">
            <div className="surface-header px-0 pt-0">
              <div>
                <h2>Hotel information</h2>
                <p>Core details travelers need to understand the property.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Hotel name</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="app-field"
                  placeholder="Grand Hunza Resort"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="app-field min-h-[120px]"
                  placeholder="Describe the property, stay style, and what makes it commercially useful in traveler offers."
                />
              </div>
            </div>
          </div>

          <div className="surface px-6 py-6">
            <div className="surface-header px-0 pt-0">
              <div>
                <h2>Location</h2>
                <p>Address details used in package assembly and traveler context.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Address</label>
                <input
                  name="address"
                  type="text"
                  required
                  value={form.address}
                  onChange={handleChange}
                  className="app-field"
                  placeholder="Main Street, Karimabad"
                />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--text)]">City</label>
                  <input
                    name="city"
                    type="text"
                    required
                    value={form.city}
                    onChange={handleChange}
                    className="app-field"
                    placeholder="Hunza"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Country</label>
                  <input
                    name="country"
                    type="text"
                    required
                    value={form.country}
                    onChange={handleChange}
                    className="app-field"
                    placeholder="Pakistan"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="surface px-6 py-6">
            <div className="surface-header px-0 pt-0">
              <div>
                <h2>Amenities</h2>
                <p>Choose the features that matter most for conversion and package fit.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => {
                const active = form.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'border-[var(--primary)] bg-[var(--panel-subtle)] text-[var(--primary)]'
                        : 'border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)]'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          <ImageGalleryInput
            title="Images"
            images={form.images}
            uploadImage={hotelsService.uploadImage}
            onChange={(images) => setForm((current) => ({ ...current, images }))}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/hotels')}
              className="app-btn-secondary h-11 px-5 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="app-btn-primary h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Saving...' : isEditing ? 'Update hotel' : 'Create hotel'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="app-panel-dark px-6 py-6">
            <div className="app-section-label text-white/55">Listing summary</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{form.name || 'New property'}</h2>
            <div className="mt-5 space-y-3 text-sm text-white/72">
              <div className="flex justify-between gap-4">
                <span>Location</span>
                <span className="text-right font-semibold text-white">{form.city || '--'}, {form.country || '--'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Amenities</span>
                <span className="text-right font-semibold text-white">{form.amenities.length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Images</span>
                <span className="text-right font-semibold text-white">{form.images.length}</span>
              </div>
            </div>
          </div>

          <div className="surface px-6 py-6">
            <div className="surface-header px-0 pt-0">
              <div>
                <h2>Publishing note</h2>
                <p>What happens after you save the listing.</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-[var(--text-muted)]">
              New or edited hotel records are available in the agency workspace immediately. No
              additional admin verification is required for hotel inventory.
            </p>
            <button
              type="button"
              onClick={() => navigate('/hotels')}
              className="app-btn-secondary mt-4 h-11 px-4 text-sm"
            >
              Back to hotels
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HotelForm;
