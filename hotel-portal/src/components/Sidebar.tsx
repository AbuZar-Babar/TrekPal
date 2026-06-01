import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

type NavItem = { path: string; label: string; shortLabel: string; icon: React.ReactNode };

const ic = (d: string | string[]) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
  </svg>
);

const overviewNav: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: ic('M3 12 12 4l9 8M5 10v10h4v-6h6v6h4V10'),
  },
];

const manageNav: NavItem[] = [
  {
    path: '/rooms',
    label: 'Rooms',
    shortLabel: 'Rooms',
    icon: ic('M3 21h18M5 21V7h14v14M9 11h2m2 0h2M9 15h2m2 0h2'),
  },
  {
    path: '/services',
    label: 'Services',
    shortLabel: 'Services',
    icon: ic('M5 13l4 4L19 7'),
  },
  {
    path: '/bookings',
    label: 'Bookings',
    shortLabel: 'Bookings',
    icon: ic('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'),
  },
  {
    path: '/settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: ic([
      'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    ]),
  },
];

const allNav = [...overviewNav, ...manageNav];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderGroup = (label: string, items: NavItem[]) => (
    <>
      <div className="hp-nav-group">{label}</div>
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `portal-nav-link ${isActive ? 'portal-nav-link-active' : ''}`
          }
        >
          <span style={{ display: 'inline-flex', width: '1rem', height: '1rem' }}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </>
  );

  return (
    <>
      <aside className="portal-sidebar">
        <div className="portal-sidebar-desktop">
          {/* Brand */}
          <div className="portal-brand">
            <div className="portal-brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
                strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M3 21h18M5 21V7h14v14M9 11h2m2 0h2M9 15h2m2 0h2" />
              </svg>
            </div>
            <div>
              <div className="portal-brand-title">TrekPal</div>
              <div className="portal-brand-subtitle">Hotel</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="portal-nav">
            {renderGroup('Overview', overviewNav)}
            {renderGroup('Manage', manageNav)}
          </nav>

          {/* Footer */}
          <div className="portal-sidebar-footer">
            <button type="button" onClick={handleLogout} className="portal-sidebar-logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
                strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <nav className="portal-mobile-nav lg:hidden" aria-label="Mobile navigation">
        {allNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `portal-mobile-link ${isActive ? 'portal-mobile-link-active' : ''}`
            }
          >
            <span style={{ display: 'inline-flex', width: '1rem', height: '1rem' }}>{item.icon}</span>
            <span>{item.shortLabel}</span>
          </NavLink>
        ))}
        <button type="button" onClick={handleLogout} className="portal-mobile-link portal-mobile-logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
            strokeLinecap="round" strokeLinejoin="round" style={{ width: '1rem', height: '1rem' }}>
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign out</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
