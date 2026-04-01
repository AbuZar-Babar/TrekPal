import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import ErrorPopup from '../../../shared/components/ErrorPopup';
import AuthShell from './AuthShell';
import { login } from '../store/authSlice';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
    <AuthShell
      badge="Agency sign in"
      title="Sign in to your operations workspace"
      subtitle="Access marketplace requests, negotiations, bookings, hotels, and vehicles from one clean operations surface."
      panelTitle="Commercial trip operations, clarified."
      panelText="The agency portal is designed for quoting, negotiation, and service execution. Keep your inventory updated and respond to traveler briefs with structured commercial offers."
      panelPoints={[
        'Review structured traveler briefs before pricing.',
        'Revise negotiation threads when the traveler counters.',
        'Manage bookings, hotels, and vehicles from the same control surface.',
      ]}
    >
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}

      <div className="app-card px-6 py-6 md:px-8 md:py-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Business email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="app-field"
              placeholder="agency@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="app-field"
              placeholder="Enter your password"
            />
            <p className="mt-2 text-xs leading-6 text-[var(--text-soft)]">
              Agency access is only enabled after admin approval.
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
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-[var(--primary)]">
              Register your agency
            </Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
};

export default LoginForm;
