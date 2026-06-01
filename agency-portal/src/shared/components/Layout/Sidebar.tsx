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
  { path: '/dashboard',   label: 'Dashboard',  shortLabel: 'Home',    icon: ic('M3 12 12 4l9 8M5 10v10h4v-6h6v6h4V10') },
];

const workNav: NavItem[] = [
  { path: '/trip-requests', label: 'Requests',  shortLabel: 'Requests', icon: ic('M4 6h16M4 12h16M4 18h10') },
  { path: '/bookings',      label: 'Bookings',  shortLabel: 'Bookings', icon: ic('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z') },
  { path: '/bids',          label: 'Bids',      shortLabel: 'Bids',     icon: ic('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h6a2 2 0 000-4M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4') },
];

const manageNav: NavItem[] = [
  { path: '/packages', label: 'Offers',      shortLabel: 'Offers',   icon: ic('M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10') },
  { path: '/hotels',   label: 'Marketplace', shortLabel: 'Market',   icon: ic('M3 21h18M5 21V7h14v14M9 11h2m2 0h2M9 15h2m2 0h2') },
  { path: '/reviews',  label: 'Reviews',     shortLabel: 'Reviews',  icon: ic('M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z') },
];

const allNav = [...overviewNav, ...workNav, ...manageNav];

const Sidebar = () => {
  const dispatch  = useDispatch();
  const location  = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const renderGroup = (label: string, items: NavItem[]) => (
    <>
      <div className="ap-nav-group">{label}</div>
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
                <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
              </svg>
            </div>
            <div>
              <div className="portal-brand-title">TrekPal</div>
              <div className="portal-brand-subtitle">Agency</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="portal-nav">
            {renderGroup('Overview', overviewNav)}
            {renderGroup('Work', workNav)}
            {renderGroup('Manage', manageNav)}
          </nav>

          {/* Footer */}
          <div className="portal-sidebar-footer">
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="portal-sidebar-logout"
              style={{ padding: '0.5rem 0.65rem', fontSize: '0.8125rem', borderRadius: '7px' }}
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
