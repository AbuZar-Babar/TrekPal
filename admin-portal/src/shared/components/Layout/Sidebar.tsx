import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { logout } from '../../../modules/auth/store/authSlice';

type NavItem = {
  path: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
};

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const overviewNav: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: icon('M3 12 12 4l9 8M5 10v10h4v-6h6v6h4V10'),
  },
  {
    path: '/analytics',
    label: 'Analytics',
    shortLabel: 'Reports',
    icon: icon('M4 19V5m0 14h16M8 16V11m4 5V8m4 8v-6'),
  },
];

const manageNav: NavItem[] = [
  {
    path: '/agencies',
    label: 'Agencies',
    shortLabel: 'Agencies',
    icon: icon('M3 21h18M5 21V8l7-4 7 4v13M9 12h2m2 0h2M9 16h2m2 0h2'),
  },
  {
    path: '/travelers',
    label: 'Travelers',
    shortLabel: 'Travelers',
    icon: icon('M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 21a8 8 0 0 1 16 0'),
  },
  {
    path: '/hotels',
    label: 'Hotels',
    shortLabel: 'Hotels',
    icon: icon('M3 21h18M5 21V7h14v14M9 11h2m2 0h2M9 15h2m2 0h2'),
  },
  {
    path: '/vehicle-providers',
    label: 'Vehicle providers',
    shortLabel: 'Providers',
    icon: icon('M5 13l1.5-5h11L19 13M5 13v5h2m12-5v5h-2M5 13h14M8 17h1m6 0h1'),
  },
];

const operationsNav: NavItem[] = [
  {
    path: '/inventory',
    label: 'Inventory',
    shortLabel: 'Inventory',
    icon: icon('M4 7h16M4 12h16M4 17h16'),
  },
];

const allNav = [...overviewNav, ...manageNav, ...operationsNav];

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogout = () => dispatch(logout());

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
          <span className="ap-stat-icon" style={{ width: '1rem', height: '1rem' }}>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <>
      <aside className="portal-sidebar">
        <div className="portal-sidebar-desktop">
          <div className="portal-brand">
            <div className="portal-brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3zm-2.25 9.25l1.75 1.75 3.75-3.75" />
              </svg>
            </div>
            <div>
              <div className="portal-brand-title">TrekPal</div>
              <div className="portal-brand-subtitle">Admin</div>
            </div>
          </div>

          <nav className="portal-nav">
            {renderGroup('Overview', overviewNav)}
            {renderGroup('Manage', manageNav)}
            {renderGroup('Operations', operationsNav)}
          </nav>

          <div className="portal-sidebar-footer">
            <button type="button" onClick={handleLogout} className="portal-sidebar-logout" style={{ padding: '0.5rem 0.65rem', fontSize: '0.8125rem', borderRadius: '7px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

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
        <button type="button" onClick={handleLogout} className="portal-mobile-link portal-mobile-logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: '1rem', height: '1rem' }}>
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
