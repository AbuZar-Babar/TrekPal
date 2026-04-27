import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, ShieldCheck, Loader2 } from 'lucide-react';
import styles from './Inventory.module.css';
import { hotelApi, Room } from '../../services/api';

const Inventory: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<Room> | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profile = await hotelApi.getProfile();
      setRooms(profile.rooms || []);
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) return;
    try {
      await hotelApi.deleteRoom(id);
      setRooms(rooms.filter(r => r.id !== id));
    } catch (error) {
      alert('Failed to delete room');
    }
  };

  const handleSaveRoom = async (data: any) => {
    try {
      if (currentRoom?.id) {
        await hotelApi.updateRoom(currentRoom.id, data);
      } else {
        await hotelApi.addRoom(data);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save room');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Room Types</h3>
          <div className={styles.value}>3</div>
        </div>
        <div className={styles.statCard}>
          <h3>Total Rooms</h3>
          <div className={styles.value}>30</div>
        </div>
        <div className={styles.statCard}>
          <h3>Avg. Occupancy</h3>
          <div className={styles.value}>68%</div>
        </div>
      </div>

      <div className={styles.roomSection}>
        <div className={styles.sectionHeader}>
          <h2>Room Management</h2>
          <button className={styles.btnAction} onClick={() => { setCurrentRoom(null); setShowModal(true); }}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} />
            Add Room Type
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)' }}>
            <Loader2 className="spin" size={32} />
          </div>
        ) : (
          <div className={styles.roomGrid}>
            {rooms.map((room) => (
              <div key={room.id} className={styles.roomCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={styles.roomBadge}>{room.type}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      style={{ color: 'var(--text-muted)', background: 'none' }}
                      onClick={() => { setCurrentRoom(room); setShowModal(true); }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      style={{ color: 'var(--danger)', background: 'none' }}
                      onClick={() => handleDelete(room.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.priceTag}>
                      Rs. {room.price.toLocaleString()}<span>/night</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Capacity: <strong>{room.capacity}</strong>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Total Units: <strong>{room.quantity}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <RoomModal 
          room={currentRoom} 
          onClose={() => setShowModal(false)} 
          onSave={handleSaveRoom} 
        />
      )}

      <div className={styles.roomSection}>
        <div className={styles.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={20} className={styles.icon} />
            <h2>Nightly Availability</h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Syncs automatically with bookings
          </p>
        </div>

        <table className={styles.availabilityTable}>
          <thead>
            <tr>
              <th>Date</th>
              {rooms.map(r => (
                <th key={r.id}>{r.type}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Mocking date rows but showing actual room counts */}
            {[...Array(5)].map((_, idx) => {
              const date = new Date();
              date.setDate(date.getDate() + idx);
              const dateStr = date.toISOString().split('T')[0];
              return (
                <tr key={idx}>
                  <td>{dateStr}</td>
                  {rooms.map(room => (
                    <td key={room.id}>
                      <input type="number" defaultValue={room.quantity} className={styles.availabilityInput} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>/ {room.quantity}</span>
                    </td>
                  ))}
                  <td>
                    <button style={{ background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem' }}>Update</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  );
};

interface RoomModalProps {
  room: Partial<Room> | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const RoomModal: React.FC<RoomModalProps> = ({ room, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: room?.type || 'SINGLE',
    price: room?.price || 5000,
    capacity: room?.capacity || 1,
    quantity: room?.quantity || 1,
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>{room ? 'Edit Room Type' : 'Add Room Type'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Room Type</label>
            <select 
              className={styles.availabilityInput} 
              style={{ width: '100%' }}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="SINGLE">Single Room</option>
              <option value="DOUBLE">Double Room</option>
              <option value="TRIPLE">Triple Room</option>
              <option value="FAMILY">Family Suite</option>
              <option value="LUXURY">Luxury Suite</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Price/Night</label>
              <input 
                type="number" 
                className={styles.availabilityInput} 
                style={{ width: '100%' }}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Capacity</label>
              <input 
                type="number" 
                className={styles.availabilityInput} 
                style={{ width: '100%' }}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Quantity</label>
            <input 
              type="number" 
              className={styles.availabilityInput} 
              style={{ width: '100%' }}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className={styles.btnAction} style={{ flex: 1 }} onClick={() => onSave(formData)}>Save</button>
            <button 
              className={styles.btnAction} 
              style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
