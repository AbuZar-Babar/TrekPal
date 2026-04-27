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
  children,
}: Omit<AuthShellProps, 'panelTitle' | 'panelText' | 'panelPoints'>) => {
  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-3 text-[var(--text)] no-underline mb-8">
            <div className="portal-brand-mark">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div className="text-xl font-bold tracking-tight">TrekPal</div>
          </Link>

          <div className="mb-8 w-full">
            <div className="app-section-label mb-3">{badge}</div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text)] mb-2">{title}</h2>
            <p className="text-[var(--text-soft)] text-sm">{subtitle}</p>
          </div>
        </div>

        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
