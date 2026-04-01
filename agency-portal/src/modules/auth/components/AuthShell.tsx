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
    <div className="min-h-screen bg-[var(--bg)] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col app-auth-grid lg:grid lg:grid-cols-[0.92fr,1.08fr]">
        <aside className="app-panel-dark hidden flex-col justify-between p-8 lg:flex xl:p-10">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/10">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">TrekPal</div>
                <div className="text-2xl font-semibold tracking-tight text-white">Agency Portal</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/70">
                {badge}
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-white xl:text-5xl">{panelTitle}</h1>
              <p className="max-w-md text-[0.97rem] leading-7 text-white/70">{panelText}</p>
            </div>

            <div className="grid gap-3">
              {panelPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-[22px] border border-white/8 bg-white/6 px-4 py-4"
                >
                  <div className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/12 text-[var(--accent)]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm leading-6 text-white/76">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/6 px-5 py-5 text-sm leading-6 text-white/60">
            Use a verified agency account to quote on traveler briefs, manage inventory, and run bookings through one operations workspace.
          </div>
        </aside>

        <main className="flex flex-1 flex-col justify-between px-5 py-6 md:px-8 md:py-8 xl:px-10">
          <div className="flex items-center justify-between gap-3">
            <Link to="/login" className="flex items-center gap-3 text-[var(--text)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--panel-strong)]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight">TrekPal Agency</div>
                <div className="text-xs text-[var(--text-soft)]">Marketplace operations</div>
              </div>
            </Link>

            <div className="hidden rounded-full border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] md:inline-flex">
              Pakistan travel network
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-10">
            <div className="mb-8 space-y-3">
              <div className="app-section-label">{badge}</div>
              <h2 className="app-title max-w-xl">{title}</h2>
              <p className="app-subtitle max-w-xl">{subtitle}</p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthShell;
