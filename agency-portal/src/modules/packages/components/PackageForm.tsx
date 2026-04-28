import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { Hotel, Vehicle } from '../../../shared/types';
import {
  validateMinLength,
  validatePositiveNumber,
} from '../../../shared/utils/validators';
import { hotelsService } from '../../hotels/services/hotelsService';
import { createPackage, updatePackage } from '../store/packagesSlice';
import { packagesService } from '../services/packagesService';
import { transportService } from '../../transport/services/transportService';

type FormErrors = Record<string, string>;

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const PackageForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditing = useMemo(() => Boolean(id), [id]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [maxSeats, setMaxSeats] = useState('');
  const [destinations, setDestinations] = useState('');
  const [images, setImages] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const selectedHotel = useMemo(
    () => hotels.find((item) => item.id === hotelId) || null,
    [hotelId, hotels],
  );
  const selectedVehicle = useMemo(
    () => vehicles.find((item) => item.id === vehicleId) || null,
    [vehicleId, vehicles],
  );

  useEffect(() => {
    let mounted = true;

    const loadInventory = async () => {
      try {
        const [hotelsResult, vehiclesResult] = await Promise.all([
          hotelsService.getHotels({ limit: 100 }),
          transportService.getVehicles({ limit: 100 }),
        ]);

        if (!mounted) {
          return;
        }

        setHotels(hotelsResult.data);
        setVehicles(vehiclesResult.data);
      } catch (error: any) {
        if (mounted) {
          setInventoryError(error.message || 'Failed to load agency inventory');
        }
      }
    };

    loadInventory();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditing || !id) {
      return;
    }

    let mounted = true;

    const loadPackage = async () => {
      try {
        const tripPackage = await packagesService.getPackageById(id);
        if (!mounted) {
          return;
        }

        setName(tripPackage.name);
        setDescription(tripPackage.description || '');
        setPrice(String(tripPackage.price));
        setDuration(String(tripPackage.duration));
        setStartDate(
          tripPackage.startDate
            ? new Date(tripPackage.startDate).toISOString().slice(0, 10)
            : '',
        );
        setMaxSeats(String(tripPackage.maxSeats ?? 1));
        setHotelId(tripPackage.hotelId || '');
        setVehicleId(tripPackage.vehicleId || '');
        setDestinations(tripPackage.destinations.join(', '));
        setImages(tripPackage.images.join(', '));
        setIsActive(tripPackage.isActive);
      } catch (error: any) {
        if (mounted) {
          setFormError(error.message || 'Failed to load trip offer');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPackage();

    return () => {
      mounted = false;
    };
  }, [id, isEditing]);

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};
    const destinationList = splitList(destinations);
    const imageList = splitList(images);

    const nameError = validateMinLength(name, 'Trip offer name', 2);
    if (nameError) {
      nextErrors.name = nameError;
    }

    const priceError = validatePositiveNumber(price, 'Price', 1);
    if (priceError) {
      nextErrors.price = priceError;
    }

    const durationError = validatePositiveNumber(duration, 'Duration', 1);
    if (durationError) {
      nextErrors.duration = durationError;
    }

    const seatsError = validatePositiveNumber(maxSeats, 'Max seats', 1);
    if (seatsError) {
      nextErrors.maxSeats = seatsError;
    }

    if (isActive && !startDate) {
      nextErrors.startDate = 'Start date is required for an active offer';
    }

    if (isActive && !hotelId) {
      nextErrors.hotelId = 'Select a hotel before publishing this offer';
    }

    if (destinationList.length === 0) {
      nextErrors.destinations = 'Add at least one destination';
    }

    if (imageList.some((value) => !isValidUrl(value))) {
      nextErrors.images = 'Each image must be a valid URL';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      duration: Number(duration),
      startDate,
      maxSeats: Number(maxSeats),
      hotelId: hotelId || null,
      vehicleId: vehicleId || null,
      destinations: splitList(destinations),
      images: splitList(images),
      isActive,
    };

    try {
      if (isEditing && id) {
        await dispatch(updatePackage({ id, data: payload }) as any).unwrap();
      } else {
        await dispatch(createPackage(payload) as any).unwrap();
      }

      navigate('/packages');
    } catch (error: any) {
      setFormError(error.message || 'Failed to save trip offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="surface px-6 py-14 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        <p className="mt-4 text-sm text-[var(--text-muted)]">Loading trip offer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <div className="space-y-3">
          <span className="app-pill app-pill-neutral">Trip offer</span>
          <h1 className="page-title">
            {isEditing ? 'Edit trip offer' : 'Create trip offer'}
          </h1>
          <p className="page-copy max-w-3xl">
            Keep the offer simple and structured. Add the route, price, duration, and the inventory
            you want to attach.
          </p>
        </div>
        <div className="page-stats-grid">
          <article className="stat-card">
            <span>Status</span>
            <strong>{isActive ? 'Live' : 'Draft'}</strong>
            <p>Published offers require a hotel and start date.</p>
          </article>
          <article className="stat-card">
            <span>Destinations</span>
            <strong>{splitList(destinations).length}</strong>
            <p>Stops or places currently attached to the offer.</p>
          </article>
          <article className="stat-card">
            <span>Media</span>
            <strong>{splitList(images).length}</strong>
            <p>Image URLs included for the offer presentation.</p>
          </article>
          <article className="stat-card">
            <span>Inventory</span>
            <strong>{selectedHotel || selectedVehicle ? 'Linked' : 'Open'}</strong>
            <p>Hotel and vehicle can be attached as operational support.</p>
          </article>
          <article className="stat-card">
            <span>Capacity</span>
            <strong>{maxSeats || '0'} seats</strong>
            <p>Confirmed bookings consume seats automatically.</p>
          </article>
        </div>
      </section>

      <section className="surface">
        <div className="surface-header">
          <div>
            <h2>{isEditing ? 'Edit trip offer' : 'Offer details'}</h2>
            <p>Use clear pricing, route detail, and linked inventory.</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="surface space-y-6 px-6 py-6 md:px-8 md:py-8">
        {formError && (
          <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
            {formError}
          </div>
        )}

        {inventoryError && (
          <div className="rounded-[22px] border border-[var(--warning-bg)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning-text)]">
            {inventoryError}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Offer name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="app-field"
              placeholder="Hunza spring tour"
            />
            {errors.name && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Price
            </label>
            <input
              id="price"
              type="number"
              min="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="app-field"
              placeholder="85000"
            />
            {errors.price && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="duration" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Duration (days)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="app-field"
              placeholder="5"
            />
            {errors.duration && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.duration}</p>}
          </div>

          <div>
            <label htmlFor="startDate" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Start date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="app-field"
            />
            {errors.startDate && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.startDate}</p>}
          </div>

          <div>
            <label htmlFor="maxSeats" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Max seats
            </label>
            <input
              id="maxSeats"
              type="number"
              min="1"
              value={maxSeats}
              onChange={(event) => setMaxSeats(event.target.value)}
              className="app-field"
              placeholder="12"
            />
            {errors.maxSeats && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.maxSeats}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="app-field min-h-[132px]"
              placeholder="Short summary of what is included."
            />
          </div>

          <div>
            <label htmlFor="hotelId" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Stay hotel
            </label>
            <select
              id="hotelId"
              value={hotelId}
              onChange={(event) => setHotelId(event.target.value)}
              className="app-field"
            >
              <option value="">No hotel selected</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name} - {hotel.city}
                </option>
              ))}
            </select>
            {errors.hotelId && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.hotelId}</p>}
          </div>

          <div>
            <label htmlFor="vehicleId" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Travel vehicle
            </label>
            <select
              id="vehicleId"
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              className="app-field"
            >
              <option value="">No vehicle selected</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} - {vehicle.type}
                </option>
              ))}
            </select>
          </div>

          {(selectedHotel || selectedVehicle) && (
            <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
              {selectedHotel && (
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    Selected hotel
                  </div>
                  {selectedHotel.images[0] && (
                    <img
                      src={selectedHotel.images[0]}
                      alt={selectedHotel.name}
                      className="mb-3 h-32 w-full rounded-[18px] object-cover"
                    />
                  )}
                  <div className="text-sm font-semibold text-[var(--text)]">{selectedHotel.name}</div>
                  <div className="mt-1 text-sm text-[var(--text-muted)]">
                    {selectedHotel.city}, {selectedHotel.country}
                  </div>
                </div>
              )}

              {selectedVehicle && (
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    Selected vehicle
                  </div>
                  {selectedVehicle.images[0] && (
                    <img
                      src={selectedVehicle.images[0]}
                      alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                      className="mb-3 h-32 w-full rounded-[18px] object-cover"
                    />
                  )}
                  <div className="text-sm font-semibold text-[var(--text)]">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </div>
                  <div className="mt-1 text-sm text-[var(--text-muted)]">
                    {selectedVehicle.type} - {selectedVehicle.capacity} seats
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="md:col-span-2">
            <label htmlFor="destinations" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Destinations
            </label>
            <input
              id="destinations"
              value={destinations}
              onChange={(event) => setDestinations(event.target.value)}
              className="app-field"
              placeholder="Hunza, Attabad, Passu"
            />
            <p className="mt-2 text-xs text-[var(--text-soft)]">Separate destinations with commas.</p>
            {errors.destinations && (
              <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.destinations}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="images" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Image URLs
            </label>
            <textarea
              id="images"
              value={images}
              onChange={(event) => setImages(event.target.value)}
              className="app-field min-h-[108px]"
              placeholder="https://... , https://..."
            />
            <p className="mt-2 text-xs text-[var(--text-soft)]">Optional. Separate each URL with a comma.</p>
            {errors.images && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.images}</p>}
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-4">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => {
              if (event.target.checked && (!hotelId || !startDate)) {
                setFormError('To publish this offer, select a hotel and start date first.');
                return;
              }
              setFormError(null);
              setIsActive(event.target.checked);
            }}
            className="h-4 w-4 rounded border-[var(--border)]"
          />
          <div>
            <div className="text-sm font-semibold text-[var(--text)]">Published</div>
            <div className="text-sm text-[var(--text-muted)]">Turn this off to hide the offer.</div>
          </div>
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/packages')}
            className="app-btn-secondary h-11 px-5 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="app-btn-primary h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create trip offer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackageForm;
