import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import AuthShell from './AuthShell';
import { login } from '../store/authSlice';
import { ValidationErrors, validateEmail, validatePassword } from '../../../shared/utils/validators';

const LoginForm = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const validate = (): boolean => {
    const next: ValidationErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) next.email = emailErr;
    const pwErr = validatePassword(password);
    if (pwErr) next.password = pwErr;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await dispatch(login({ email: email.trim(), password }) as any).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (msg.toLowerCase().includes('pending')) {
        navigate('/pending-approval', { replace: true, state: { email: email.trim() } });
        return;
      }
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell variant="login" maxWidth="26rem">
      <div className="auth-card">
        {/* Heading */}
        <div className="mb-7">
          <h1 className="text-[1.375rem] font-semibold tracking-tight text-[var(--text)]">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            Access your agency workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Global error */}
          {formError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="mt-0.5 h-4 w-4 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {formError}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="auth-field-label">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-field"
              placeholder="agency@example.com"
            />
            {errors.email && <p className="mt-1.5 text-xs text-[var(--danger-text)]">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="auth-field-label">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-field pr-11"
                placeholder="Enter your password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)] hover:text-[var(--text)]"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-[var(--danger-text)]">{errors.password}</p>}
            <p className="mt-1.5 text-xs text-[var(--text-soft)]">
              Access is locked until admin approval.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary mt-1 h-11 w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in…
              </span>
            ) : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 border-t border-[var(--border)] pt-5 text-center text-sm text-[var(--text-soft)]">
          No account?{' '}
          <Link to="/signup" className="font-semibold text-[var(--primary)] hover:underline">
            Register your agency
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default LoginForm;
