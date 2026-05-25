import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Edit2, Trash2, X, Coffee, Wifi, Car, Utensils, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';
import { useAuthStore } from '../../../store/useAuthStore';

interface HotelService {
  id: string;
  name: string;
  price?: number;
}

const serviceIcons: Record<string, any> = {
  'Wifi': Wifi,
  'Breakfast': Coffee,
  'Parking': Car,
  'Dinner': Utensils,
  'Default': Info
};

const ServicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingService, setEditingService] = useState<HotelService | null>(null);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel-services', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

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
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--tp-text)]">Hotel Services</h1>
          <p className="text-[var(--tp-text-muted)]">Manage extra services like WiFi, Breakfast, etc.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" /> Add New Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {isAdding && (
            <ServiceForm 
              onClose={() => setIsAdding(false)} 
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          )}
          
          {services.map((service) => {
            const Icon = serviceIcons[service.name] || serviceIcons['Default'];
            return (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 flex items-start gap-4 group"
              >
                <div className="rounded-xl bg-primary-500/12 p-3 text-primary-500 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[var(--tp-text)]">{service.name}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingService(service)} className="text-[var(--tp-text-soft)] transition-colors hover:text-primary-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(service.id)} className="text-[var(--tp-text-soft)] transition-colors hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-[var(--tp-text-muted)]">Additional service</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-bold text-[var(--tp-text)]">
                      {service.price && service.price > 0 ? `PKR ${service.price.toLocaleString()}` : 'Free'}
                    </span>
                    <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-500 bg-primary-500/12">
                      Active
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {editingService && (
        <ServiceForm 
          service={editingService}
          onClose={() => setEditingService(null)}
          onSubmit={(data) => updateMutation.mutate({ ...editingService, ...data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
};

interface ServiceFormProps {
  service?: HotelService;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    price: service?.price || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-panel)] shadow-2xl shadow-black/20"
      >
        <div className="flex items-center justify-between border-b border-[var(--tp-border)] p-6">
          <h2 className="text-xl font-bold text-[var(--tp-text)]">{service ? 'Edit Service' : 'Add New Service'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-[var(--tp-panel-subtle)]">
            <X className="w-5 h-5 text-[var(--tp-text-muted)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Service Name</label>
            <input 
              required
              className="input-field" 
              placeholder="e.g. Complimentary Breakfast"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="label">Price (PKR, 0 for Free)</label>
            <input 
              required
              type="number" 
              className="input-field" 
              placeholder="0.00"
              value={formData.price}
              onChange={e => setFormData({...formData, price: Number(e.target.value)})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (service ? 'Save Changes' : 'Add Service')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ServicesPage;
