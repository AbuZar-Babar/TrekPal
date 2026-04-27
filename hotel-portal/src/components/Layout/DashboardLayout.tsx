import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BedDouble, Settings, LogOut, Package, User, Bell, Loader2 } from 'lucide-react';
import styles from './DashboardLayout.module.css';
import { hotelApi, HotelProfile } from '../../services/api';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<HotelProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await hotelApi.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Auth check failed', error);
        // If not logged in, redirect to signup for now (since login is coming soon)
        // navigate('/signup');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/signup'; // Simple redirect for now
  };
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.avatar}>T</div>
          TrekPal Hotels
        </div>

        <nav className={styles.nav}>
          <NavLink 
            to="/dashboard" 
            end 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
          >
            <LayoutDashboard size={20} />
            Overview
          </NavLink>
          <NavLink 
            to="/dashboard/inventory" 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
          >
            <BedDouble size={20} />
            Inventory & Rooms
          </NavLink>
          <NavLink 
            to="/dashboard/services" 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
          >
            <Package size={20} />
            Services
          </NavLink>
          <NavLink 
            to="/dashboard/profile" 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
          >
            <User size={20} />
            Hotel Profile
          </NavLink>
        </nav>

        <button 
          className={styles.navLink} 
          style={{ marginTop: 'auto', border: 'none', background: 'none', width: '100%', cursor: 'pointer' }}
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </aside>

      <main className={styles.content}>
        <header className={styles.header}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {loading ? 'Loading...' : `Welcome Back, ${profile?.name || 'Hotelier'}`}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {profile?.city ? `${profile.city}, ${profile.country}` : 'Manage your hotel inventory and bookings'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className={styles.navLink} style={{ padding: '0.5rem' }}>
              <Bell size={20} />
            </button>
            <div className={styles.userProfile}>
              <div className={styles.avatar} style={{ width: 24, height: 24, fontSize: '0.75rem' }}>M</div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Manager</span>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
