import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { logout } from '../../../modules/auth/store/authSlice';

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" />
      </svg>
    ),
  },
  {
    path: '/transport',
    label: 'Fleet',
    shortLabel: 'Fleet',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 17h.01M16 17h.01M3 11l1.5-5.25A2 2 0 016.42 4h11.16a2 2 0 011.92 1.75L21 11M3 11v6a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-6M3 11h18" />
      </svg>
    ),
  },
  {
    path: '/bookings',
    label: 'Bookings',
    shortLabel: 'Trips',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 4h10l3 3v13H4V7l3-3zm0 5h10M8 13h8M8 17h5" />
      </svg>
    ),
  },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <aside className="portal-sidebar">
        <div className="portal-sidebar-desktop">
          <div className="portal-brand">
            <div className="portal-brand-mark">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13h18l-1.5-5.25A2 2 0 0017.58 6H6.42a2 2 0 00-1.92 1.75L3 13zm2 0v4a1 1 0 001 1h1a2 2 0 104 0h2a2 2 0 104 0h1a1 1 0 001-1v-4" />
              </svg>
            </div>
            <div>
              <div className="portal-brand-title">TrekPal</div>
              <div className="portal-brand-subtitle">Vehicle portal</div>
            </div>
          </div>

          <nav className="portal-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`portal-nav-link ${isActive(item.path) ? 'portal-nav-link-active' : ''}`}
              >
                <span>{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="portal-sidebar-footer">
            <div className="portal-partner-card">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--success-text)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-text)]"></span>
                VEHICLE PARTNER
              </p>
            </div>
            <button type="button" onClick={handleLogout} className="portal-sidebar-logout">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <nav className="portal-mobile-nav lg:hidden" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`portal-mobile-link ${isActive(item.path) ? 'portal-mobile-link-active' : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.shortLabel}</span>
          </Link>
        ))}
        <button type="button" onClick={handleLogout} className="portal-mobile-link portal-mobile-logout">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
