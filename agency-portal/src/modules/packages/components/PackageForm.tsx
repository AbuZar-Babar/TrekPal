import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import {
  createPackage,
  updatePackage,
} from '../store/packagesSlice';
import { packagesService } from '../services/packagesService';
import {
  validateMinLength,
  validatePositiveNumber,
} from '../../../shared/utils/validators';

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
  const [destinations, setDestinations] = useState('');
  const [images, setImages] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

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
      <div className="app-card px-6 py-14 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        <p className="mt-4 text-sm text-[var(--text-muted)]">Loading trip offer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="app-card px-6 py-6 md:px-8 md:py-8">
        <div className="app-section-label">Trip offer</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">
          {isEditing ? 'Edit trip offer' : 'Create trip offer'}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Keep it short. Add the route, price, duration, and whether it is published.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="app-card space-y-6 px-6 py-6 md:px-8 md:py-8">
        {formError && (
          <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
            {formError}
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
            onChange={(event) => setIsActive(event.target.checked)}
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
