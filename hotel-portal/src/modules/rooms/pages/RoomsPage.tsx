import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BedDouble, Plus, Loader2, Edit2, Trash2, X, Info, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';
import { useAuthStore } from '../../../store/useAuthStore';

interface Room {
  id: string;
  type: string;
  description: string;
  pricePerNight: number;
  totalRooms: number;
  amenities: string[];
  imageUrl?: string;
}

const RoomsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const hotelId = user?.hotel?.id;
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Fetch Hotel with Rooms
  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: async () => {
      const response = await api.get(`/hotels/${hotelId}`);
      return response.data;
    },
    enabled: !!hotelId,
  });

  const rooms: Room[] = hotel?.rooms || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Room>) => api.post(`/hotels/${hotelId}/rooms`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel', hotelId] });
      setIsAdding(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Room) => api.put(`/hotels/rooms/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel', hotelId] });
      setEditingRoom(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => api.delete(`/hotels/rooms/${roomId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel', hotelId] });
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
          <h1 className="text-2xl font-bold text-slate-900">Room Management</h1>
          <p className="text-slate-500">Add and manage your hotel room types and availability</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" /> Add New Room Type
        </button>
      </div>

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
                {room.imageUrl ? (
                  <img src={room.imageUrl} alt={room.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                    ${room.pricePerNight}/night
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{room.type}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{room.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-slate-400" />
                    <span>{room.totalRooms} Rooms Total</span>
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
    description: room?.description || '',
    pricePerNight: room?.pricePerNight || 0,
    totalRooms: room?.totalRooms || 1,
    amenities: room?.amenities?.join(', ') || '',
    imageUrl: room?.imageUrl || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      pricePerNight: Number(formData.pricePerNight),
      totalRooms: Number(formData.totalRooms),
      amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
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
              <label className="label">Price Per Night ($)</label>
              <input 
                required
                type="number" 
                className="input-field" 
                placeholder="0.00"
                value={formData.pricePerNight}
                onChange={e => setFormData({...formData, pricePerNight: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="label">Total Rooms Available</label>
            <input 
              required
              type="number" 
              className="input-field" 
              placeholder="1"
              value={formData.totalRooms}
              onChange={e => setFormData({...formData, totalRooms: Number(e.target.value)})}
            />
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" /> This will be used to track daily availability
            </p>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea 
              required
              className="input-field min-h-[80px]" 
              placeholder="Describe the room features..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
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
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
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
