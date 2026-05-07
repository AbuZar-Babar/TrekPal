import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

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
  return (
    <div className="auth-shell">
      <div className="auth-frame">
        <aside className="auth-aside">
          <div>
            <div className="app-section-label">TrekPal vehicle partner</div>
            <h2 className="page-title mt-4">Launch your fleet on TrekPal</h2>
            <p className="page-copy">
              Same trusted partner experience as hotel portal, now tailored for standalone vehicle providers.
            </p>
          </div>

          <div className="space-y-3">
            <div className="auth-point">Register as a vehicle provider and wait for admin approval.</div>
            <div className="auth-point">Add vehicles with documents, pricing, and availability.</div>
            <div className="auth-point">Approved vehicles appear in traveler marketplace flows.</div>
          </div>
        </aside>

        <main className="auth-main">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link to="/" className="mb-6 flex items-center gap-3 text-[var(--text)] no-underline">
              <div className="portal-brand-mark">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13h18l-1.5-5.25A2 2 0 0017.58 6H6.42a2 2 0 00-1.92 1.75L3 13zm2 0v4a1 1 0 001 1h1a2 2 0 104 0h2a2 2 0 104 0h1a1 1 0 001-1v-4" />
                </svg>
              </div>
              <div className="text-xl font-bold tracking-tight">TrekPal</div>
            </Link>

            <div className="mb-3 app-section-label">{badge}</div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] mb-2">{title}</h1>
            <p className="text-[var(--text-soft)] text-sm">{subtitle}</p>
            <div className="mt-4 auth-chip">Vehicle Portal</div>
          </div>

          <div className="mx-auto w-full max-w-md">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthShell;
