import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';

interface HotelProfile {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  email?: string | null;
  phone?: string | null;
  images: string[];
  amenities: string[];
}

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: 'Pakistan',
    latitude: '',
    longitude: '',
    email: '',
    phone: '',
    images: '',
    amenities: '',
  });

  const { data: hotel, isLoading } = useQuery<HotelProfile | null>({
    queryKey: ['hotel-profile'],
    queryFn: async () => {
      const response = await api.get('/hotels', { params: { page: 1, limit: 1 } });
      return response.data?.data?.hotels?.[0] ?? null;
    },
  });

  useEffect(() => {
    if (!hotel) return;
    setForm({
      name: hotel.name || '',
      description: hotel.description || '',
      address: hotel.address || '',
      city: hotel.city || '',
      country: hotel.country || 'Pakistan',
      latitude: hotel.latitude?.toString() || '',
      longitude: hotel.longitude?.toString() || '',
      email: hotel.email || '',
      phone: hotel.phone || '',
      images: (hotel.images || []).join(', '),
      amenities: (hotel.amenities || []).join(', '),
    });
  }, [hotel]);

  const imageList = useMemo(
    () => form.images.split(',').map((s) => s.trim()).filter(Boolean),
    [form.images]
  );

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!hotel?.id) throw new Error('No hotel profile found');
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        images: imageList,
        amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const response = await api.put(`/hotels/${hotel.id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['hotel-profile'] });
      queryClient.invalidateQueries({ queryKey: ['hotel'] });
      queryClient.invalidateQueries({ queryKey: ['hotel-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['hotel-services'] });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || err?.message || 'Failed to update hotel profile');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const field = (
    key: keyof typeof form,
    label: string,
    opts?: { type?: string; placeholder?: string; required?: boolean; step?: string }
  ) => (
    <div>
      <label className="auth-field-label">{label}</label>
      <input
        type={opts?.type || 'text'}
        required={opts?.required}
        step={opts?.step}
        className="input-field"
        placeholder={opts?.placeholder}
        value={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--tp-border)] border-t-[var(--tp-primary)]" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)] px-5 py-6 text-sm text-[var(--tp-text-muted)]">
        No hotel profile found for this account.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="border-b border-[var(--tp-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--tp-text)]">Settings</h1>
        <p className="mt-0.5 text-sm text-[var(--tp-text-soft)]">
          Update your hotel description, location, images, and details visible to agencies
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Error / success */}
        {error && (
          <div className="rounded-xl border border-[var(--tp-danger-bg)] bg-[var(--tp-danger-bg)] px-4 py-3 text-sm text-[var(--tp-danger-text)]">
            {error}
          </div>
        )}
        {saved && (
          <div className="rounded-xl border border-[var(--tp-success-bg)] bg-[var(--tp-success-bg)] px-4 py-3 text-sm text-[var(--tp-success-text)]">
            Profile saved successfully.
          </div>
        )}

        {/* Section: Basic info */}
        <div className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)]">
          <div className="border-b border-[var(--tp-border)] px-5 py-3">
            <h2 className="text-sm font-semibold text-[var(--tp-text)]">Basic information</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {field('name', 'Hotel name', { required: true, placeholder: 'Grand Luxury Hotel' })}
              {field('phone', 'Phone', { placeholder: '+92 300 1234567' })}
            </div>
            {field('email', 'Email', { type: 'email', placeholder: 'hotel@example.com' })}
            <div>
              <label className="auth-field-label">Description</label>
              <textarea
                rows={3}
                className="input-field resize-none"
                placeholder="Describe your property, location advantages, and amenities."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Section: Location */}
        <div className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)]">
          <div className="border-b border-[var(--tp-border)] px-5 py-3">
            <h2 className="text-sm font-semibold text-[var(--tp-text)]">Location</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                {field('address', 'Address', { required: true, placeholder: 'Main Mall Road, Murree' })}
              </div>
              {field('city', 'City', { required: true, placeholder: 'Murree' })}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {field('country', 'Country', { required: true })}
              {field('latitude', 'Latitude', { type: 'number', step: 'any', placeholder: '33.9072' })}
              {field('longitude', 'Longitude', { type: 'number', step: 'any', placeholder: '73.3904' })}
            </div>
          </div>
        </div>

        {/* Section: Amenities & Images */}
        <div className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)]">
          <div className="border-b border-[var(--tp-border)] px-5 py-3">
            <h2 className="text-sm font-semibold text-[var(--tp-text)]">Amenities & gallery</h2>
          </div>
          <div className="p-5 space-y-4">
            {field('amenities', 'Amenities (comma separated)', { placeholder: 'WiFi, Parking, Breakfast, AC' })}
            {field('images', 'Image URLs (comma separated)', { placeholder: 'https://.../front.jpg, https://.../lobby.jpg' })}

            {imageList.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {imageList.slice(0, 8).map((src) => (
                  <img key={src} src={src} alt="" className="h-20 w-full rounded-lg border border-[var(--tp-border)] object-cover" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary h-10 px-6 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </span>
            ) : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
