import React from 'react';
import { useLocation } from 'react-router-dom';

import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../shared/theme/ThemeProvider';

const routeMeta = [
  {
    match: '/dashboard',
    title: 'Hotel dashboard',
    description: 'Track rooms, services, bookings, and hotel readiness from one place.',
  },
  {
    match: '/rooms',
    title: 'Room management',
    description: 'Maintain room inventory, prices, occupancy, and availability.',
  },
  {
    match: '/services',
    title: 'Services',
    description: 'Manage hotel services that can be attached to traveler offers.',
  },
  {
    match: '/bookings',
    title: 'Hotel bookings',
    description: 'Review confirmed stays and keep reservation status current.',
  },
  {
    match: '/settings',
    title: 'Settings',
    description: 'Update hotel profile and operational configuration.',
  },
];

const formatToday = () =>
  new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

const Header: React.FC = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useTheme();
  const currentRoute = routeMeta.find((item) => location.pathname.startsWith(item.match));

  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        <div className="min-w-0">
          <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--tp-text-soft)]">
            TrekPal hotel partner
          </div>
          <h1 className="mt-2 truncate text-[1.35rem] font-semibold tracking-[-0.035em] text-[var(--tp-text)] sm:text-[1.55rem] md:text-[2rem]">
            {currentRoute?.title || 'Hotel portal'}
          </h1>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-[var(--tp-text-muted)] sm:text-sm">
            {currentRoute?.description || 'Operate your hotel from one clean, responsive workspace.'}
          </p>
        </div>

        <div className="portal-header-actions">
          <div className="hidden rounded-full border border-[var(--tp-border)] bg-[var(--tp-panel)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-text-soft)] md:inline-flex">
            {formatToday()}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="portal-icon-btn h-10 w-10 md:h-11 md:w-11"
            aria-label="Toggle theme"
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
            <div className="portal-avatar">{user?.name?.charAt(0).toUpperCase() || 'H'}</div>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-sm font-semibold tracking-tight text-[var(--tp-text)]">
                {user?.name || 'Hotel workspace'}
              </div>
              <div className="truncate text-xs text-[var(--tp-text-soft)]">
                {user?.email || 'hotel@trekpal.pk'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
