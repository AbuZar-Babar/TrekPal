import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ErrorPopup from '../../../shared/components/ErrorPopup';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { login } from '../store/authSlice';

const AdminLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return;
      }

      await dispatch(login({ email, password }) as any).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-16%] h-[420px] w-[420px] rounded-full bg-[var(--primary-container)] opacity-60 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-10%] h-[460px] w-[460px] rounded-full bg-[var(--secondary-container)] opacity-50 blur-3xl" />
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="sovereign-button-secondary absolute right-6 top-6 h-11 px-4"
      >
        {theme === 'dark' ? (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m15.114 6.364-1.591-1.591M7.477 7.477 5.886 5.886m12.228 0-1.591 1.591M7.477 16.523l-1.591 1.591M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Light mode
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12.79A9 9 0 1111.21 3c0 .56.06 1.107.174 1.634A7 7 0 0019.366 12.4c.527.114 1.074.174 1.634.174z" />
            </svg>
            Dark mode
          </>
        )}
      </button>

      <div className="relative w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[var(--surface-high)] text-[var(--primary)] shadow-[0_20px_40px_rgba(42,52,57,0.06)]">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <h1 className="mt-6 font-headline text-4xl font-extrabold tracking-tight text-[var(--text)]">
            TrekPal Sovereign
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[var(--text-soft)]">
            Precision Admin Control Interface
          </p>
        </div>

        <div className="sovereign-panel p-8 lg:p-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="sovereign-label block" htmlFor="email">
                Administrator Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-soft)]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="sovereign-input pl-11"
                  placeholder="admin@trekpal.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="sovereign-label block" htmlFor="password">
                  Sovereign Password
                </label>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                  Protected Access
                </span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-soft)]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="sovereign-input pl-11"
                  placeholder="Enter your password"
                />
              </div>
              <p className="text-xs leading-6 text-[var(--text-muted)]">
                Demo credentials: <span className="font-semibold text-[var(--text)]">admin@trekpal.com / password123</span>
              </p>
            </div>

            <button type="submit" disabled={loading} className="sovereign-button-primary h-14 w-full px-6 text-sm">
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in to sovereign control
                </>
              ) : (
                'Log In to Sovereign Control'
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-[var(--border)] pt-8">
            <p className="text-center text-[11px] leading-6 text-[var(--text-muted)]">
              TrekPal Admin System
              <br />
              Unauthorized access is actively monitored and logged.
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 hidden w-full px-8 pb-8 opacity-35 xl:block">
        <div className="flex items-end justify-between font-headline text-[64px] font-black leading-none text-[var(--surface-strong)]">
          <span>RIGOR</span>
          <span>TRUST</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;
