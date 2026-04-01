import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { createHotel, fetchHotels, updateHotel } from '../store/hotelsSlice';
import { hotelsService } from '../services/hotelsService';

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
  const [imageUrl, setImageUrl] = useState('');

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

  const handleAddImage = () => {
    if (imageUrl.trim() && !form.images.includes(imageUrl.trim())) {
      setForm((current) => ({ ...current, images: [...current.images, imageUrl.trim()] }));
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
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
      <div className="app-table-shell px-6 py-14 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        <p className="mt-4 text-sm text-[var(--text-muted)]">Loading hotel details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="app-section-label">{isEditing ? 'Edit hotel' : 'New hotel'}</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">
            {isEditing ? 'Update hotel property details' : 'Create a hotel listing'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/hotels')}
          className="app-btn-secondary h-11 px-4 text-sm"
        >
          Back to hotels
        </button>
      </div>

      {error && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <div className="app-card px-6 py-6">
            <div className="app-section-label">Hotel information</div>
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

          <div className="app-card px-6 py-6">
            <div className="app-section-label">Location</div>
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

          <div className="app-card px-6 py-6">
            <div className="app-section-label">Amenities</div>
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

          <div className="app-card px-6 py-6">
            <div className="app-section-label">Images</div>
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr,auto]">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  className="app-field"
                  placeholder="Paste an image URL"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddImage();
                    }
                  }}
                />
                <button type="button" onClick={handleAddImage} className="app-btn-secondary h-11 px-5 text-sm">
                  Add image
                </button>
              </div>
              {form.images.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {form.images.map((image, index) => (
                    <div key={image} className="relative overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)]">
                      <img src={image} alt="" className="h-36 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-white"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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

          <div className="app-card px-6 py-6">
            <div className="app-section-label">Publishing note</div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text)]">Instant publishing</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              New or edited hotel records are available in the agency workspace immediately. No additional admin verification is required for hotel inventory.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HotelForm;
