import React, { useLayoutEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  const { data: hotel, isLoading, isError } = useQuery({
    queryKey: ['hotel', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await api.get(`/hotels/${user.id}`);
      return response.data?.data ?? null;
    },
    enabled: !!user?.id,
  });

  const hotelId = hotel?.id;
  const rooms: Room[] = hotel?.rooms || [];

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
    },
    onError: (error: any) => {
      setActionError(error?.response?.data?.message || 'Failed to delete room');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--tp-border)] border-t-[var(--tp-primary)]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-[var(--tp-danger-bg)] bg-[var(--tp-danger-bg)] px-4 py-3 text-sm text-[var(--tp-danger-text)]">
        Failed to load hotel profile. Please sign in again.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--tp-border)] pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--tp-text)]">Rooms</h1>
          <p className="mt-0.5 text-sm text-[var(--tp-text-soft)]">
            {rooms.length} room type{rooms.length !== 1 ? 's' : ''} — manage inventory and availability
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          disabled={!hotelId}
          className="h-9 rounded-lg bg-[var(--tp-primary)] px-4 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Add room type
        </button>
      </div>

      {/* Error */}
      {actionError && (
        <div className="rounded-xl border border-[var(--tp-danger-bg)] bg-[var(--tp-danger-bg)] px-4 py-3 text-sm text-[var(--tp-danger-text)]">
          {actionError}
        </div>
      )}

      {/* Grid */}
      {rooms.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[var(--tp-text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7h14v14M9 11h2m2 0h2M9 15h2m2 0h2" />
          </svg>
          <p className="text-sm text-[var(--tp-text-soft)]">No room types yet — add one to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.id} className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-panel)] overflow-hidden">
              {room.images?.[0] ? (
                <img src={room.images[0]} alt={room.type} className="h-36 w-full object-cover" />
              ) : (
                <div className="h-36 w-full bg-[var(--tp-panel-subtle)] flex items-center justify-center text-xs text-[var(--tp-text-soft)]">
                  No image
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-[var(--tp-text)]">{room.type}</div>
                    <div className="text-xs text-[var(--tp-text-soft)] mt-0.5">{room.capacity} guests · {room.quantity} rooms</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-[var(--tp-text-soft)]">per night</div>
                    <div className="text-sm font-semibold text-[var(--tp-text)]">PKR {room.price.toLocaleString()}</div>
                  </div>
                </div>

                {room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {room.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="rounded-full border border-[var(--tp-border)] px-2 py-0.5 text-[10px] text-[var(--tp-text-muted)]">
                        {a}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="rounded-full border border-[var(--tp-border)] px-2 py-0.5 text-[10px] text-[var(--tp-text-muted)]">
                        +{room.amenities.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--tp-border)]">
                  <button
                    onClick={() => setEditingRoom(room)}
                    className="flex-1 h-8 rounded-lg border border-[var(--tp-border)] text-xs font-medium text-[var(--tp-primary)] hover:bg-[var(--tp-panel-subtle)] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this room type?')) deleteMutation.mutate(room.id);
                    }}
                    className="flex-1 h-8 rounded-lg border border-[var(--tp-border)] text-xs font-medium text-[var(--tp-danger-text)] hover:bg-[var(--tp-danger-bg)] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isAdding && (
        <RoomModal
          onClose={() => setIsAdding(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}
      {editingRoom && (
        <RoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSubmit={(data) => updateMutation.mutate({ ...editingRoom, ...data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
};

interface RoomModalProps {
  room?: Room;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const RoomModal: React.FC<RoomModalProps> = ({ room, onClose, onSubmit, isLoading }) => {
  useLayoutEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const [formData, setFormData] = useState({
    type: room?.type || '',
    price: room?.price ?? 0,
    capacity: room?.capacity ?? 1,
    quantity: room?.quantity ?? 1,
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
      amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      images: formData.image ? [formData.image] : [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-panel)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--tp-border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--tp-text)]">{room ? 'Edit room type' : 'Add room type'}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tp-border)] text-[var(--tp-text-muted)] hover:text-[var(--tp-text)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="auth-field-label">Room type</label>
              <input required className="input-field" placeholder="e.g. Deluxe Suite"
                value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
            </div>
            <div>
              <label className="auth-field-label">Price per night (PKR)</label>
              <input required type="number" className="input-field" placeholder="0"
                value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
            </div>
            <div>
              <label className="auth-field-label">Capacity (guests)</label>
              <input required type="number" className="input-field" placeholder="2"
                value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="auth-field-label">Total rooms</label>
              <input required type="number" className="input-field" placeholder="1"
                value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className="auth-field-label">Amenities (comma separated)</label>
            <input className="input-field" placeholder="WiFi, TV, Air Conditioning"
              value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} />
          </div>

          <div>
            <label className="auth-field-label">Image URL (optional)</label>
            <input className="input-field" placeholder="https://example.com/room.jpg"
              value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
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
              ) : room ? 'Save changes' : 'Add room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomsPage;
