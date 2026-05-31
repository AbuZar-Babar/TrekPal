import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../shared/theme/ThemeProvider';

interface AuthShellProps {
  children: ReactNode;
  /** 'login' centres vertically, 'register' aligns top (long form) */
  variant?: 'login' | 'register';
  maxWidth?: string;
}

const AuthShell = ({ children, variant = 'login', maxWidth = '28rem' }: AuthShellProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="auth-page">
      {/* ── Topbar ─────────────────────────────────────────── */}
      <header className="auth-topbar">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
            </svg>
          </span>
          <span className="auth-logo-name">TrekPal</span>
          <span className="auth-logo-tag">Agency</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="portal-icon-btn h-8 w-8"
        >
          {theme === 'dark' ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m15.114 6.364l-1.591-1.591M7.477 7.477 5.886 5.886m12.228 0-1.591 1.591M7.477 16.523l-1.591 1.591M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12.79A9 9 0 1111.21 3c0 .56.06 1.107.174 1.634A7 7 0 0019.366 12.4c.527.114 1.074.174 1.634.174z" />
            </svg>
          )}
        </button>
      </header>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className={`auth-body ${variant === 'login' ? 'auth-body-center' : ''}`}>
        <div style={{ width: '100%', maxWidth }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
