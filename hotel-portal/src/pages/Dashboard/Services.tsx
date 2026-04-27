import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Zap, Loader2 } from 'lucide-react';
import styles from './Inventory.module.css';
import { hotelApi, HotelService } from '../../services/api';

const Services: React.FC = () => {
  const [services, setServices] = useState<HotelService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const profile = await hotelApi.getProfile();
      setServices(profile.services || []);
    } catch (error) {
      console.error('Failed to fetch services', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await hotelApi.deleteService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (error) {
      alert('Failed to delete service');
    }
  };

  const handleAddService = async (data: any) => {
    try {
      await hotelApi.addService(data);
      setShowModal(false);
      fetchServices();
    } catch (error) {
      alert('Failed to add service');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={24} className={styles.icon} style={{ color: 'var(--warning)' }} />
          <h2>Extra Services</h2>
        </div>
        <button className={styles.btnAction} onClick={() => setShowModal(true)}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} />
          Add Service
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="spin" /></div>
      ) : (
        <div className={styles.roomGrid}>
          {services.map((service) => (
            <div key={service.id} className={styles.roomCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{service.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    style={{ color: 'var(--danger)', background: 'none' }}
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={styles.priceTag}>
                  Rs. {service.price.toLocaleString()}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Additional Service</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <ServiceModal onClose={() => setShowModal(false)} onSave={handleAddService} />}

      <div style={{ marginTop: '3rem', background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        <h3>Service Insights</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          These services will be visible to travelers and agencies when they book rooms at your hotel.
        </p>
      </div>
    </div>
  );
const ServiceModal: React.FC<{ onClose: () => void; onSave: (data: any) => void }> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', price: 0 });
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', width: '400px', border: '1px solid var(--border)' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Add Service</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Service Name</label>
            <input 
              type="text" 
              className={styles.availabilityInput} 
              style={{ width: '100%' }}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Price (Rs.)</label>
            <input 
              type="number" 
              className={styles.availabilityInput} 
              style={{ width: '100%' }}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className={styles.btnAction} style={{ flex: 1 }} onClick={() => onSave(formData)}>Add</button>
            <button className={styles.btnAction} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }} onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
