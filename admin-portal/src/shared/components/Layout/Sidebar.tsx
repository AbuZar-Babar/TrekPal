import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" />
        </svg>
      ),
    },
    {
      path: '/agencies',
      label: 'Agencies',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      path: '/users',
      label: 'Travelers',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      path: '/hotels',
      label: 'Hotels',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11 2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4m-4 0v-5a2 2 0 00-2-2 2 2 0 00-2 2v5" />
        </svg>
      ),
    },
    {
      path: '/vehicles',
      label: 'Vehicles',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 17h.01M16 17h.01M3 11l1.5-5.25A2 2 0 016.42 4h11.16a2 2 0 011.92 1.75L21 11M3 11v6a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-6M3 11h18" />
        </svg>
      ),
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      path: '/activity',
      label: 'Activity',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12h4l2.5-6 4 12L16 12h5" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-[88px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)] xl:w-[280px]">
      <div className="border-b border-[var(--border)] px-4 py-5 xl:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--surface)] text-[var(--primary)] shadow-[0_12px_24px_rgba(42,52,57,0.08)]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <div className="hidden xl:block">
            <h1 className="font-headline text-xl font-extrabold tracking-tight text-[var(--text)]">
              TrekPal Sovereign
            </h1>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
              Precision Admin Control
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5 xl:px-4">
        <p className="mb-3 px-2 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)] xl:text-left">
          Review surfaces
        </p>
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center justify-center gap-3 rounded-[18px] px-3 py-3 text-sm font-semibold transition-all duration-200 xl:justify-start ${
                isActive
                  ? 'bg-[var(--sidebar-elevated)] text-[var(--primary)] shadow-[0_14px_28px_rgba(42,52,57,0.08)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                {item.icon}
              </span>
              <span className="hidden xl:block">{item.label}</span>
              <span
                className={`hidden h-2 w-2 rounded-full bg-[var(--primary)] xl:ml-auto xl:block ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] px-3 py-4 xl:px-4">
        <div className="hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 xl:block">
          <div className="sovereign-label">Command posture</div>
          <div className="mt-2 text-sm font-semibold text-[var(--text)]">Trusted review workspace</div>
          <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">
            Inspect approvals, moderate inventory, and keep verification queues under control.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
