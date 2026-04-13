import { Link, useLocation } from 'react-router-dom';

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
    path: '/packages',
    label: 'Trip offers',
    shortLabel: 'Offers',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2m0 18 6-3m-6 3V2m6 15 6-3m-6 3V5m6 9V4m0 0L15 5" />
      </svg>
    ),
  },
  {
    path: '/trip-requests',
    label: 'Traveler requests',
    shortLabel: 'Requests',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h10m6 0h.01M16 18h.01" />
      </svg>
    ),
  },
  {
    path: '/bookings',
    label: 'Bookings',
    shortLabel: 'Bookings',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: '/chat',
    label: 'Offer chat',
    shortLabel: 'Chat',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 8h10M7 12h7m-9 8l-4-4V6a2 2 0 012-2h18a2 2 0 012 2v10a2 2 0 01-2 2H7z" />
      </svg>
    ),
  },
  {
    path: '/hotels',
    label: 'Hotels',
    shortLabel: 'Hotels',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    path: '/transport',
    label: 'Vehicles',
    shortLabel: 'Fleet',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 17h.01M16 17h.01M3 11l1.5-5.25A2 2 0 016.42 4h11.16a2 2 0 011.92 1.75L21 11M3 11v6a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-6M3 11h18" />
      </svg>
    ),
  },
];

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      <aside className="portal-sidebar">
        <div className="portal-sidebar-desktop">
          <div className="portal-brand">
            <div className="portal-brand-mark">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-[var(--text)]">TrekPal</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[var(--sidebar-muted)]">Agency portal</div>
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
            <div className="app-card-subtle px-4 py-4">
              <div className="app-section-label">Workspace</div>
              <div className="mt-2 text-sm font-semibold text-[var(--text)]">Approved access</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                Offers, requests, inventory, and live booking operations in one place.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <nav className="portal-mobile-tabbar lg:hidden">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`portal-mobile-link ${isActive(item.path) ? 'portal-mobile-link-active' : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.shortLabel}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
