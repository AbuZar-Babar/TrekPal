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
    { match: '/dashboard', title: 'Agency Operations Overview', description: 'Track inventory, live negotiation threads, and booking movement.' },
    { match: '/trip-requests', title: 'Marketplace', description: 'Review traveler briefs and respond with structured commercial offers.' },
    { match: '/bookings', title: 'Accepted Bookings', description: 'Manage confirmed traveler work and milestone execution.' },
    { match: '/hotels', title: 'Hotels', description: 'Maintain stay inventory for quote packaging and booking delivery.' },
    { match: '/transport', title: 'Vehicles', description: 'Manage approved fleet capacity, pricing, and transport readiness.' },
    { match: '/profile', title: 'Agency Profile', description: 'View current access, identity anchors, and operational snapshot.' },
    { match: '/status', title: 'Business Status', description: 'Review approval posture and readiness checks across the portal.' },
  ].find((item) => location.pathname.startsWith(item.match));

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--canvas)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 md:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
        <div className="min-w-0">
          <div className="app-section-label">TrekPal agency</div>
          <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-[var(--text)]">
            {routeMeta?.title || 'Agency Portal'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{routeMeta?.description || 'Operate traveler marketplace workflows from one place.'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)] md:inline-flex">
            {formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="app-btn-secondary h-12 px-4 text-sm"
          >
            {theme === 'dark' ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m15.114 6.364l-1.591-1.591M7.477 7.477 5.886 5.886m12.228 0-1.591 1.591M7.477 16.523l-1.591 1.591M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Light mode
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12.79A9 9 0 1111.21 3c0 .56.06 1.107.174 1.634A7 7 0 0019.366 12.4c.527.114 1.074.174 1.634.174z" />
                </svg>
                Dark mode
              </>
            )}
          </button>

          <div className="app-pill app-pill-success">Approved agency</div>

          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--panel-strong)] font-semibold text-[var(--text)]">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden min-w-0 md:block">
                <div className="truncate text-sm font-semibold tracking-tight text-[var(--text)]">{user?.name || 'Agency workspace'}</div>
                <div className="truncate text-xs text-[var(--text-soft)]">{user?.email || 'agency@trekpal.pk'}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="app-btn-secondary h-12 px-4 text-sm text-[var(--danger-text)]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
