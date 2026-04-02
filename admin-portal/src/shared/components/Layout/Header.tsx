import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { logout } from '../../../modules/auth/store/authSlice';
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
    match: '/analytics',
    title: 'Analytics',
    description: 'Users, queues, and booking trend',
  },
];

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const currentRoute = routeMeta.find((item) => location.pathname.startsWith(item.match));

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-4 py-4 md:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
        <div className="min-w-0">
          <div className="sovereign-label">Admin portal</div>
          <h1 className="mt-2 truncate font-headline text-2xl font-extrabold tracking-tight text-[var(--text)]">
            {currentRoute?.title || 'TrekPal Admin'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {currentRoute?.description || 'Simple admin workflow'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] md:inline-flex">
            {formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>

          <button type="button" onClick={toggleTheme} className="sovereign-button-secondary h-11 px-4">
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--surface-high)] font-semibold text-[var(--text)]">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
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

          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="sovereign-button-danger h-11 px-4"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
