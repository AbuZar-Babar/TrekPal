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
      path: '/trip-requests',
      label: 'Marketplace',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h10m6 0h.01M16 18h.01" />
        </svg>
      ),
    },
    {
      path: '/bookings',
      label: 'Bookings',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      path: '/hotels',
      label: 'Hotels',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      path: '/transport',
      label: 'Vehicles',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 17h.01M16 17h.01M3 11l1.5-5.25A2 2 0 016.42 4h11.16a2 2 0 011.92 1.75L21 11M3 11v6a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-6M3 11h18" />
        </svg>
      ),
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.121 17.804A7.968 7.968 0 0112 14a7.968 7.968 0 016.879 3.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      path: '/status',
      label: 'Status',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-[88px] flex-col border-r border-white/6 bg-[var(--sidebar)] text-white xl:w-[280px]">
      <div className="border-b border-white/8 px-4 py-5 xl:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/10 text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <div className="hidden xl:block">
            <h1 className="text-lg font-semibold tracking-tight text-white">TrekPal</h1>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--sidebar-muted)]">Agency portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5 xl:px-4">
        <p className="mb-3 px-2 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--sidebar-muted)] xl:text-left">Operations</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center justify-center gap-3 rounded-[18px] px-3 py-3 text-sm font-medium transition-all duration-200 xl:justify-start ${
                isActive
                  ? 'bg-white/10 text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)]'
                  : 'text-[var(--sidebar-muted)] hover:bg-white/6 hover:text-white'
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                {item.icon}
              </span>
              <span className="hidden xl:block">{item.label}</span>
              <span className={`hidden h-2 w-2 rounded-full bg-[var(--accent)] xl:ml-auto xl:block ${isActive ? 'opacity-100' : 'opacity-0'}`} />
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/8 px-3 py-4 xl:px-4">
        <div className="hidden rounded-[20px] border border-white/8 bg-white/6 px-4 py-4 xl:block">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--sidebar-muted)]">Status</div>
          <div className="mt-2 text-sm font-semibold text-white">Approved operations</div>
          <p className="mt-2 text-xs leading-6 text-white/60">Quote traveler briefs, manage inventory, and operate bookings from one workspace.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
