import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../../../modules/auth/store/authSlice';

type NavItem = { path: string; label: string; shortLabel: string; icon: React.ReactNode };

const ic = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
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
    path: '/transport',
    label: 'Fleet',
    shortLabel: 'Fleet',
    icon: ic('M5 13l1.5-5h11L19 13M5 13v5h2m12-5v5h-2M5 13h14M7 18a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z'),
  },
  {
    path: '/bookings',
    label: 'Bookings',
    shortLabel: 'Trips',
    icon: ic('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'),
  },
];

const allNav = [...overviewNav, ...manageNav];

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const renderGroup = (label: string, items: NavItem[]) => (
    <>
      <div className="vp-nav-group">{label}</div>
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`portal-nav-link ${isActive(item.path) ? 'portal-nav-link-active' : ''}`}
        >
          <span style={{ display: 'inline-flex', width: '1rem', height: '1rem' }}>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
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
                <path d="M5 13l1.5-5h11L19 13M5 13v5h2m12-5v5h-2M5 13h14M7 18a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </div>
            <div>
              <div className="portal-brand-title">TrekPal</div>
              <div className="portal-brand-subtitle">Vehicle</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="portal-nav">
            {renderGroup('Overview', overviewNav)}
            {renderGroup('Manage', manageNav)}
          </nav>

          {/* Footer */}
          <div className="portal-sidebar-footer">
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="portal-sidebar-logout"
            >
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
          <Link
            key={item.path}
            to={item.path}
            className={`portal-mobile-link ${isActive(item.path) ? 'portal-mobile-link-active' : ''}`}
          >
            <span style={{ display: 'inline-flex', width: '1rem', height: '1rem' }}>{item.icon}</span>
            <span>{item.shortLabel}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="portal-mobile-link portal-mobile-logout"
        >
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
