import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthShellProps {
  badge: string;
  title: string;
  subtitle: string;
  panelTitle: string;
  panelText: string;
  panelPoints: string[];
  children: ReactNode;
}

const AuthShell = ({
  badge,
  title,
  subtitle,
  panelTitle,
  panelText,
  panelPoints,
  children,
}: AuthShellProps) => {
  return (
    <div className="auth-shell bg-[var(--bg)]">
      <div className="auth-frame">
        <aside className="auth-aside">
          <div>
            <div className="flex items-center gap-3">
              <div className="portal-brand-mark">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-[var(--text)]">TrekPal</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)]">Agency portal</div>
              </div>
            </div>

            <div className="mt-10 auth-chip">{badge}</div>
            <h1 className="mt-5 app-title max-w-md">{panelTitle}</h1>
            <p className="mt-4 app-subtitle max-w-md">{panelText}</p>

            <div className="mt-8 grid gap-3">
              {panelPoints.map((point) => (
                <div key={point} className="auth-point">
                  {point}
                </div>
              ))}
            </div>
          </div>

        </aside>

        <main className="auth-main">
          <div className="flex items-center justify-between gap-3">
            <Link to="/login" className="flex items-center gap-3 text-[var(--text)] no-underline">
              <div className="portal-brand-mark">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight">TrekPal Agency</div>
              </div>
            </Link>

          </div>

          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-10">
            <div className="mb-8 space-y-3">
              <div className="app-section-label">{badge}</div>
              <h2 className="app-title max-w-2xl">{title}</h2>
              <p className="app-subtitle max-w-2xl">{subtitle}</p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthShell;
