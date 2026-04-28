import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { logout } from '../../../modules/auth/store/authSlice';
import { RootState } from '../../../store';
import { useTheme } from '../../theme/ThemeProvider';
import { formatDate } from '../../utils/formatters';

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
  };

  const routeMeta = [
    { match: '/dashboard', title: 'Agency dashboard', description: 'The cleanest view of requests, offers, bookings, and inventory.' },
    { match: '/packages', title: 'Trip offers', description: 'Build and refine the offers your agency wants to sell.' },
    { match: '/trip-requests', title: 'Traveler requests', description: 'Review live demand, quote quickly, and keep negotiations moving.' },
    { match: '/bookings', title: 'Bookings', description: 'Confirm, complete, or close active traveler commitments.' },
    { match: '/chat', title: 'Offer chat', description: 'Talk with travelers after an offer has been confirmed.' },
    { match: '/hotels', title: 'Hotels', description: 'Maintain stay inventory for cleaner offer packaging.' },
    { match: '/transport', title: 'Vehicles', description: 'Manage fleet readiness and transport pricing.' },
  ].find((item) => location.pathname.startsWith(item.match));

  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        <div className="min-w-0">
          <div className="app-section-label">TrekPal agency</div>
          <h1 className="mt-2 truncate text-[1.35rem] font-semibold tracking-[-0.035em] text-[var(--text)] sm:text-[1.55rem] md:text-[2rem]">
            {routeMeta?.title || 'Agency portal'}
          </h1>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-[var(--text-muted)] sm:text-sm">
            {routeMeta?.description || 'Operate your agency from one clean, responsive workspace.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <div className="hidden rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)] md:inline-flex">
            {formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>

          <button type="button" onClick={toggleTheme} className="portal-icon-btn h-10 w-10 md:h-11 md:w-11" aria-label="Toggle theme">
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

          <div className="app-pill app-pill-success hidden sm:inline-flex">Approved</div>

          <div className="portal-user-card">
            <div className="portal-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-sm font-semibold tracking-tight text-[var(--text)]">
                {user?.name || 'Agency workspace'}
              </div>
              <div className="truncate text-xs text-[var(--text-soft)]">
                {user?.email || 'agency@trekpal.pk'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="app-btn-secondary h-10 px-3 text-xs text-[var(--danger-text)] sm:h-11 sm:px-4 sm:text-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
