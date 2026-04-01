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

  const routeMeta = [
    {
      match: '/dashboard',
      title: 'Operational Overview',
      description: 'System health, review queues, and logistics performance at a glance.',
    },
    {
      match: '/agencies',
      title: 'Agency Approvals',
      description: 'Inspect submitted business evidence and make approval decisions.',
    },
    {
      match: '/users',
      title: 'Traveler Review',
      description: 'Monitor traveler verification posture and KYC submission signals.',
    },
    {
      match: '/hotels',
      title: 'Hotel Moderation',
      description: 'Review hospitality inventory quality, location data, and approval state.',
    },
    {
      match: '/vehicles',
      title: 'Vehicle Approvals',
      description: 'Verify fleet readiness, pricing posture, and compliance-sensitive records.',
    },
    {
      match: '/reports',
      title: 'Reports & Analytics',
      description: 'Read platform growth, booking movement, and revenue trends clearly.',
    },
    {
      match: '/activity',
      title: 'Audit & Moderation Activity',
      description: 'Track the latest activity feed across agency, traveler, hotel, and vehicle review.',
    },
  ].find((item) => location.pathname.startsWith(item.match));

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-4 py-4 md:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
        <div className="min-w-0">
          <div className="sovereign-label">TrekPal sovereign</div>
          <h1 className="mt-2 truncate font-headline text-2xl font-extrabold tracking-tight text-[var(--text)]">
            {routeMeta?.title || 'Precision Admin Control'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {routeMeta?.description || 'Review the platform with clarity, rigor, and tonal precision.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden min-w-[320px] items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:flex">
            <svg className="h-4 w-4 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-soft)]"
              placeholder="Search systems, applications, or traveler IDs..."
            />
          </div>

          <div className="hidden rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] md:inline-flex">
            {formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>

          <button type="button" onClick={toggleTheme} className="sovereign-button-secondary h-11 px-4">
            {theme === 'dark' ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m15.114 6.364-1.591-1.591M7.477 7.477 5.886 5.886m12.228 0-1.591 1.591M7.477 16.523l-1.591 1.591M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

          <div className="sovereign-pill sovereign-pill-success">Sovereign live</div>

          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--surface-high)] font-semibold text-[var(--text)]">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden min-w-0 md:block">
                <div className="truncate text-sm font-semibold tracking-tight text-[var(--text)]">
                  {user?.name || 'Admin Profile'}
                </div>
                <div className="truncate text-xs text-[var(--text-soft)]">
                  {user?.email || 'admin@trekpal.com'}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="sovereign-button-danger h-11 px-4"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
