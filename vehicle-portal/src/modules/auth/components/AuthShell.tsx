import { ReactNode } from 'react';
import { useTheme } from '../../../shared/theme/ThemeProvider';

interface AuthShellProps {
  children: ReactNode;
  centered?: boolean;
}

const AuthShell = ({ children, centered = true }: AuthShellProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `radial-gradient(ellipse 70% 40% at 60% -10%, color-mix(in srgb, var(--primary) 8%, transparent), transparent), var(--bg)`,
      }}
    >
      {/* Topbar */}
      <header
        className="flex items-center justify-between h-14 px-6 shrink-0"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--panel) 90%, transparent)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: '1.875rem', height: '1.875rem', background: 'var(--primary)', color: '#fff' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
              strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M5 13l1.5-5h11L19 13M5 13v5h2m12-5v5h-2M5 13h14M7 18a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text)' }}>TrekPal</span>
          <span
            className="text-[0.6875rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: 'var(--text-soft)', border: '1px solid var(--border)' }}
          >
            Vehicle
          </span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          className="flex items-center justify-center rounded-lg"
          style={{
            width: '2rem', height: '2rem',
            border: '1px solid var(--border)',
            background: 'var(--panel)',
            color: 'var(--text)',
          }}
        >
          {theme === 'dark' ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m15.114 6.364l-1.591-1.591M7.477 7.477 5.886 5.886m12.228 0-1.591 1.591M7.477 16.523l-1.591 1.591M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M21 12.79A9 9 0 1111.21 3c0 .56.06 1.107.174 1.634A7 7 0 0019.366 12.4c.527.114 1.074.174 1.634.174z" />
            </svg>
          )}
        </button>
      </header>

      {/* Body */}
      <div
        className={`flex flex-1 justify-center px-4 py-12 ${centered ? 'items-center' : 'items-start'}`}
      >
        <div className="w-full" style={{ maxWidth: centered ? '26rem' : '42rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
