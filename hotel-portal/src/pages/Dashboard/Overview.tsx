import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, Star, AlertCircle, Loader2 } from 'lucide-react';
import styles from './Inventory.module.css'; // Reusing some stats grid styles
import { hotelApi, HotelProfile } from '../../services/api';

const Overview: React.FC = () => {
  const [profile, setProfile] = useState<HotelProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await hotelApi.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)' }}>
        <Loader2 className="spin" size={48} />
        <p style={{ marginTop: '1rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {profile?.status === 'PENDING' && (
        <div style={{ 
          background: 'rgba(245, 158, 11, 0.1)', 
          border: '1px solid var(--warning)', 
          padding: '1rem', 
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: 'var(--warning)'
        }}>
          <AlertCircle size={24} />
          <div>
            <h4 style={{ margin: 0 }}>Approval Pending</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Your hotel is currently being reviewed by our administrators. Once approved, it will be visible to all agencies.</p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome, {profile?.name}</h2>
        <p style={{ color: 'var(--text-muted)' }}>Location: {profile?.city}, {profile?.country}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Total Revenue</h3>
            <TrendingUp size={16} color="var(--success)" />
          </div>
          <div className={styles.value}>Rs. 124,500</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>+12% from last month</p>
        </div>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Active Bookings</h3>
            <Calendar size={16} color="var(--primary)" />
          </div>
          <div className={styles.value}>18</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>4 checking in today</p>
        </div>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Total Room Types</h3>
            <Users size={16} color="#c084fc" />
          </div>
          <div className={styles.value}>{profile?.rooms?.length || 0}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manage in Inventory tab</p>
        </div>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Rating</h3>
            <Star size={16} color="var(--warning)" />
          </div>
          <div className={styles.value}>4.8/5.0</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on 24 reviews</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Requests from Agencies</h3>
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            No pending requests at the moment.
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem', fontWeight: 600 }}>Update Room Status</button>
            <button style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem', fontWeight: 600 }}>Generate Report</button>
            <button style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem', fontWeight: 600 }}>View Calendar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
