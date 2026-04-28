import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';

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
      if (!hotel?.id) {
        throw new Error('No hotel profile found');
      }

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
      queryClient.invalidateQueries({ queryKey: ['hotel-profile'] });
      queryClient.invalidateQueries({ queryKey: ['hotel'] });
      queryClient.invalidateQueries({ queryKey: ['hotel-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['hotel-services'] });
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to update hotel profile'
      );
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold text-slate-900">Hotel Profile</h2>
        <p className="mt-2 text-sm text-slate-500">No hotel profile found for this account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Hotel Profile Settings</h1>
        <p className="text-slate-500">Update your hotel description, location, images, and public details visible to agencies.</p>
      </header>

      <form onSubmit={onSubmit} className="card p-6 space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Hotel Name</label>
            <input
              required
              className="input-field"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input-field"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input-field min-h-[110px] py-3"
            placeholder="Describe your property, location advantages, and amenities."
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="label">Address</label>
            <input
              required
              className="input-field"
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">City</label>
            <input
              required
              className="input-field"
              value={form.city}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Country</label>
            <input
              required
              className="input-field"
              value={form.country}
              onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Latitude</label>
            <input
              type="number"
              step="any"
              className="input-field"
              value={form.latitude}
              onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Longitude</label>
            <input
              type="number"
              step="any"
              className="input-field"
              value={form.longitude}
              onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="label">Amenities (comma separated)</label>
          <input
            className="input-field"
            placeholder="WiFi, Parking, Breakfast, AC"
            value={form.amenities}
            onChange={(e) => setForm((prev) => ({ ...prev, amenities: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Image URLs (comma separated)</label>
          <input
            className="input-field"
            placeholder="https://.../front.jpg, https://.../lobby.jpg"
            value={form.images}
            onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))}
          />
        </div>

        {imageList.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {imageList.slice(0, 8).map((src) => (
              <img key={src} src={src} alt="Hotel preview" className="h-20 w-full object-cover rounded-lg border border-slate-200" />
            ))}
          </div>
        )}

        <div className="pt-2">
          <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
            {updateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" /> Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
