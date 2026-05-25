import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { RootState } from '../../../store';
import { useTheme } from '../../theme/ThemeProvider';
import { formatDate } from '../../utils/formatters';

const routeMeta = [
  {
    match: '/dashboard',
    title: 'Dashboard',
    description: 'Pending work and quick actions',
  },
  {
    match: '/agencies',
    title: 'Agencies',
    description: 'Approve, reject, or edit agencies',
  },
  {
    match: '/travelers',
    title: 'Travelers',
    description: 'Approve, reject, or edit travelers',
  },
  {
    match: '/inventory',
    title: 'Inventory',
    description: 'View hotels and vehicles',
  },
  {
    match: '/vehicle-providers',
    title: 'Vehicle Providers',
    description: 'Approve or reject vehicle provider applications',
  },
  {
    match: '/analytics',
    title: 'Analytics',
    description: 'Users, queues, and booking trend',
  },
];

const Header = () => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const currentRoute = routeMeta.find((item) => location.pathname.startsWith(item.match));

  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        <div className="min-w-0">
          <div className="sovereign-label">Admin portal</div>
          <h1 className="mt-2 truncate font-headline text-2xl font-extrabold tracking-tight text-[var(--text)]">
            {currentRoute?.title || 'TrekPal Admin'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {currentRoute?.description || 'Simple admin workflow'}
          </p>
        </div>

        <div className="portal-header-actions">
          <div className="hidden rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] md:inline-flex">
            {formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="portal-icon-btn h-10 w-10 md:h-11 md:w-11"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m15.114 6.364l-1.591-1.591M7.477 7.477 5.886 5.886m12.228 0-1.591 1.591M7.477 16.523l-1.591 1.591M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12.79A9 9 0 1111.21 3c0 .56.06 1.107.174 1.634A7 7 0 0019.366 12.4c.527.114 1.074.174 1.634.174z" />
              </svg>
            )}
          </button>

          <div className="portal-user-card">
            <div className="portal-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="hidden min-w-0 md:block">
              <div className="truncate text-sm font-semibold tracking-tight text-[var(--text)]">
                {user?.name || 'Admin'}
              </div>
              <div className="truncate text-xs text-[var(--text-soft)]">
                {user?.email || 'admin@trekpal.com'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
