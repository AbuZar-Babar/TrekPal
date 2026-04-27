import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import AuthShell from './AuthShell';
import { login } from '../store/authSlice';
import {
  ValidationErrors,
  validateEmail,
  validatePassword,
} from '../../../shared/utils/validators';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const nextErrors: ValidationErrors = {};

    const emailError = validateEmail(email);
    if (emailError) {
      nextErrors.email = emailError;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      nextErrors.password = passwordError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await dispatch(login({ email: email.trim(), password }) as any).unwrap();
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.message || 'Login failed';

      if (message.toLowerCase().includes('pending approval') || message.toLowerCase().includes('pending admin')) {
        navigate('/pending-approval', {
          replace: true,
          state: {
            email: email.trim(),
          },
        });
        return;
      }

      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Agency Portal"
      title="Sign in"
      subtitle="Access your agency dashboard."
    >
      <div className="app-card px-6 py-6 md:px-8 md:py-8">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="rounded-[20px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="app-field"
              placeholder="agency@example.com"
            />
            {errors.email && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="app-field"
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.password}</p>
            )}
            <p className="mt-2 text-xs text-[var(--text-soft)]">
              Login stays blocked until admin approval.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary h-12 w-full px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="border-t border-[var(--border)] pt-5 text-center text-sm text-[var(--text-muted)]">
            No account yet?{' '}
            <Link to="/signup" className="font-semibold text-[var(--primary)]">
              Register agency
            </Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
};

export default LoginForm;
