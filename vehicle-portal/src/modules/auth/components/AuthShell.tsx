import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { PortalPageTransition } from '../../../shared/components/motion/portalMotion';

interface AuthShellProps {
  badge: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

const AuthShell = ({
  badge,
  title,
  subtitle,
  children,
}: AuthShellProps) => {
  const highlights = [
    'Register vehicles and assigned drivers in one workflow.',
    'Monitor availability and bookings without leaving the portal.',
    'Account access opens automatically after admin approval.',
  ];

  return (
    <div className="auth-shell bg-[var(--bg)]">
      <PortalPageTransition className="auth-frame">
        <aside className="auth-aside">
          <div>
            <Link to="/" className="flex items-center gap-3 text-[var(--text)] no-underline">
              <div className="portal-brand-mark">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13h18l-1.5-5.25A2 2 0 0017.58 6H6.42a2 2 0 00-1.92 1.75L3 13zm2 0v4a1 1 0 001 1h1a2 2 0 104 0h2a2 2 0 104 0h1a1 1 0 001-1v-4" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight">TrekPal</div>
                <div className="portal-brand-subtitle">Vehicle Portal</div>
              </div>
            </Link>

            <div className="mt-10">
              <div className="auth-chip">{badge}</div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-[var(--text)]">{title}</h1>
              <p className="mt-3 max-w-md text-sm leading-7 text-[var(--text-muted)]">{subtitle}</p>
            </div>
          </div>

          <div className="grid gap-3">
            {highlights.map((item) => (
              <div key={item} className="auth-point">
                {item}
              </div>
            ))}
          </div>
        </aside>

        <main className="auth-main flex items-center">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <Link to="/" className="mb-6 flex items-center gap-3 text-[var(--text)] no-underline">
                <div className="portal-brand-mark">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13h18l-1.5-5.25A2 2 0 0017.58 6H6.42a2 2 0 00-1.92 1.75L3 13zm2 0v4a1 1 0 001 1h1a2 2 0 104 0h2a2 2 0 104 0h1a1 1 0 001-1v-4" />
                  </svg>
                </div>
                <div className="text-xl font-bold tracking-tight">TrekPal</div>
              </Link>
              <div className="auth-chip">{badge}</div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--text)]">{title}</h2>
              <p className="mt-2 text-sm text-[var(--text-soft)]">{subtitle}</p>
            </div>

            {children}
          </div>
        </main>
      </PortalPageTransition>
    </div>
  );
};

export default AuthShell;
