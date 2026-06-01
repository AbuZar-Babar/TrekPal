import React, { useLayoutEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import { useAuthStore } from '../../../store/useAuthStore';

interface HotelService {
  id: string;
  name: string;
  price?: number;
}

const ServicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [isAdding, setIsAdding] = useState(false);
  const [editingService, setEditingService] = useState<HotelService | null>(null);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel-services', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await api.get(`/hotels/${user.id}`);
      return response.data?.data ?? null;
    },
    enabled: !!user?.id,
  });

  const hotelId = hotel?.id;
  const services: HotelService[] = hotel?.services || [];

  const createMutation = useMutation({
    mutationFn: (data: Partial<HotelService>) => api.post(`/hotels/${hotelId}/services`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-services', user?.id] });
      setIsAdding(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: HotelService) => api.put(`/hotels/services/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-services', user?.id] });
      setEditingService(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (serviceId: string) => api.delete(`/hotels/services/${serviceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-services', user?.id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--tp-border)] border-t-[var(--tp-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--tp-border)] pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--tp-text)]">Services</h1>
          <p className="mt-0.5 text-sm text-[var(--tp-text-soft)]">
            {services.length} service{services.length !== 1 ? 's' : ''} — manage extras like WiFi, breakfast, parking
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="h-9 rounded-lg bg-[var(--tp-primary)] px-4 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Add service
        </button>
      </div>

      {/* Grid */}
      {services.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[var(--tp-text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a5 5 0 100 10A5 5 0 0012 2zM2 20a10 10 0 0120 0" />
          </svg>
          <p className="text-sm text-[var(--tp-text-soft)]">No services yet — add one to get started</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--tp-panel-subtle)] text-[var(--tp-primary)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--tp-text)] truncate">{service.name}</div>
                  <div className="text-sm text-[var(--tp-text-soft)] mt-0.5">
                    {service.price && service.price > 0
                      ? `PKR ${service.price.toLocaleString()}`
                      : 'Complimentary'}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--tp-success-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--tp-success-text)]">
                  Active
                </span>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--tp-border)]">
                <button
                  onClick={() => setEditingService(service)}
                  className="flex-1 h-8 rounded-lg border border-[var(--tp-border)] text-xs font-medium text-[var(--tp-primary)] hover:bg-[var(--tp-panel-subtle)] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this service?')) deleteMutation.mutate(service.id);
                  }}
                  className="flex-1 h-8 rounded-lg border border-[var(--tp-border)] text-xs font-medium text-[var(--tp-danger-text)] hover:bg-[var(--tp-danger-bg)] transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isAdding && (
        <ServiceModal
          onClose={() => setIsAdding(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}
      {editingService && (
        <ServiceModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onSubmit={(data) => updateMutation.mutate({ ...editingService, ...data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
};

interface ServiceModalProps {
  service?: HotelService;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose, onSubmit, isLoading }) => {
  useLayoutEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const [formData, setFormData] = useState({
    name: service?.name || '',
    price: service?.price ?? 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, price: Number(formData.price) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-panel)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--tp-border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--tp-text)]">{service ? 'Edit service' : 'Add service'}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tp-border)] text-[var(--tp-text-muted)] hover:text-[var(--tp-text)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="auth-field-label">Service name</label>
            <input required className="input-field" placeholder="e.g. Complimentary Breakfast"
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="auth-field-label">Price in PKR (0 for free)</label>
            <input required type="number" className="input-field" placeholder="0"
              value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 h-10">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 h-10">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </span>
              ) : service ? 'Save changes' : 'Add service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServicesPage;
