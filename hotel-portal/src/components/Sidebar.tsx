import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Building2,
  CalendarCheck,
  Coffee,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', shortLabel: 'Home', path: '/dashboard' },
  { icon: BedDouble, label: 'Rooms', shortLabel: 'Rooms', path: '/rooms' },
  { icon: Coffee, label: 'Services', shortLabel: 'Services', path: '/services' },
  { icon: CalendarCheck, label: 'Bookings', shortLabel: 'Bookings', path: '/bookings' },
  { icon: Settings, label: 'Settings', shortLabel: 'Settings', path: '/settings' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className="portal-sidebar">
        <div className="portal-sidebar-desktop">
          <div className="portal-brand">
            <div className="portal-brand-mark">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="portal-brand-title">TrekPal</div>
              <div className="portal-brand-subtitle">Hotel portal</div>
            </div>
          </div>

          <nav className="portal-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `portal-nav-link ${isActive ? 'portal-nav-link-active' : ''}`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="portal-sidebar-footer">
            <div className="portal-partner-card">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--tp-success-text)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--tp-success-text)]"></span>
                HOTEL PARTNER
              </p>
            </div>
            <button type="button" onClick={handleLogout} className="portal-sidebar-logout">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <nav className="portal-mobile-nav lg:hidden" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `portal-mobile-link ${isActive ? 'portal-mobile-link-active' : ''}`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.shortLabel}</span>
          </NavLink>
        ))}
        <button type="button" onClick={handleLogout} className="portal-mobile-link portal-mobile-logout">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
