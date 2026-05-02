import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BedDouble, Plus, Loader2, Edit2, Trash2, X, Info, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';
import { useAuthStore } from '../../../store/useAuthStore';

interface Room {
  id: string;
  type: string;
  price: number;
  capacity: number;
  quantity: number;
  amenities: string[];
  images?: string[];
}

const RoomsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch current authenticated hotel profile
  const { data: hotel, isLoading, isError } = useQuery({
    queryKey: ['hotel', user?.id],
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
  const rooms: Room[] = hotel?.rooms || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Room>) => api.post(`/hotels/${hotelId}/rooms`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel', user?.id] });
      setIsAdding(false);
      setActionError(null);
    },
    onError: (error: any) => {
      setActionError(error?.response?.data?.message || 'Failed to create room');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Room) => api.put(`/hotels/rooms/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel', user?.id] });
      setEditingRoom(null);
      setActionError(null);
    },
    onError: (error: any) => {
      setActionError(error?.response?.data?.message || 'Failed to update room');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => api.delete(`/hotels/rooms/${roomId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel', user?.id] });
      setActionError(null);
    },
    onError: (error: any) => {
      setActionError(error?.response?.data?.message || 'Failed to delete room');
    },
  });

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-900">Room Management</h1>
        <p className="mt-3 text-sm text-rose-600">Failed to load hotel profile. Please sign in again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Room Management</h1>
          <p className="text-slate-500">Add and manage your hotel room types and availability</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          disabled={!hotelId}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" /> Add New Room Type
        </button>
      </div>

      {actionError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {isAdding && (
            <RoomForm 
              onClose={() => setIsAdding(false)} 
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          )}
          
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card group hover:border-primary-200 transition-colors"
            >
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                  {room.images?.[0] ? (
                  <img src={room.images[0]} alt={room.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mb-2" />
                    <span className="text-xs">No image uploaded</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => setEditingRoom(room)}
                    className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this room type?')) {
                        deleteMutation.mutate(room.id);
                      }
                    }}
                    className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-primary-700 shadow-sm">
                    PKR {room.price.toLocaleString()}/night
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{room.type}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">Capacity: {room.capacity} guests</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-slate-400" />
                    <span>{room.quantity} Rooms Total</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold uppercase tracking-wider">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {rooms.length === 0 && !isAdding && (
        <div className="card p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">No rooms found</h2>
          <p className="mt-2 text-sm text-slate-500">
            This hotel does not have any room types saved yet for the current account.
          </p>
        </div>
      )}

      {editingRoom && (
        <RoomForm 
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSubmit={(data) => updateMutation.mutate({ ...editingRoom, ...data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
};

interface RoomFormProps {
  room?: Room;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const RoomForm: React.FC<RoomFormProps> = ({ room, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    type: room?.type || '',
    price: room?.price || 0,
    capacity: room?.capacity || 1,
    quantity: room?.quantity || 1,
    amenities: room?.amenities?.join(', ') || '',
    image: room?.images?.[0] || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      capacity: Number(formData.capacity),
      quantity: Number(formData.quantity),
      amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
      images: formData.image ? [formData.image] : [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{room ? 'Edit Room' : 'Add New Room Type'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Room Type</label>
              <input 
                required
                className="input-field" 
                placeholder="e.g. Deluxe Suite"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              />
            </div>
            <div>
              <label className="label">Price Per Night (PKR)</label>
              <input 
                required
                type="number" 
                className="input-field" 
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="label">Room Capacity</label>
            <input 
              required
              type="number" 
              className="input-field" 
              placeholder="2"
              value={formData.capacity}
              onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
            />
          </div>

          <div>
            <label className="label">Total Rooms Available</label>
            <input 
              required
              type="number" 
              className="input-field" 
              placeholder="1"
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
            />
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" /> This will be used to track daily availability
            </p>
          </div>

          <div>
            <label className="label">Amenities (comma separated)</label>
            <input 
              className="input-field" 
              placeholder="WiFi, TV, Air Conditioning, Breakfast"
              value={formData.amenities}
              onChange={e => setFormData({...formData, amenities: e.target.value})}
            />
          </div>

          <div>
            <label className="label">Image URL (Optional)</label>
            <input 
              className="input-field" 
              placeholder="https://example.com/room.jpg"
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (room ? 'Save Changes' : 'Create Room')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RoomsPage;
