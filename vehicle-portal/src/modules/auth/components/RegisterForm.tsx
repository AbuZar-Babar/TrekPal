import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import AuthShell from './AuthShell';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { signup } from '../store/authSlice';
import {
  ValidationErrors,
  validateCnic,
  validateEmail,
  validateMinLength,
  validatePassword,
  validatePhone,
} from '../../../shared/utils/validators';

const RegisterForm = () => {
  const [loading, setLoading]     = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors]       = useState<ValidationErrors>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    ownerName: '',
    phone: '',
    cnic: '',
    address: '',
  });

  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validateAll = (): ValidationErrors => {
    const next: ValidationErrors = {};
    const nameErr     = validateMinLength(form.name, 'Business name', 2);
    if (nameErr)     next.name = nameErr;
    const emailErr    = validateEmail(form.email);
    if (emailErr)    next.email = emailErr;
    const pwErr       = validatePassword(form.password);
    if (pwErr)       next.password = pwErr;
    const ownerErr    = validateMinLength(form.ownerName, 'Owner name', 2);
    if (ownerErr)    next.ownerName = ownerErr;
    const phoneErr    = validatePhone(form.phone);
    if (phoneErr)    next.phone = phoneErr;
    const cnicErr     = validateCnic(form.cnic);
    if (cnicErr)     next.cnic = cnicErr;
    const addressErr  = validateMinLength(form.address, 'Address', 5);
    if (addressErr)  next.address = addressErr;
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const next = validateAll();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await dispatch(
        signup({
          email:     form.email.trim(),
          password:  form.password,
          name:      form.name.trim(),
          phone:     form.phone.trim(),
          address:   form.address.trim(),
          ownerName: form.ownerName.trim(),
          cnic:      form.cnic,
        }) as any,
      ).unwrap();

      navigate('/pending-approval', {
        state: { email: form.email.trim(), name: form.name.trim() },
      });
    } catch (err: any) {
      setFormError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fieldLabel = (text: string) => (
    <label className="block mb-1.5 text-[0.8125rem] font-medium" style={{ color: 'var(--text-muted)' }}>
      {text}
    </label>
  );

  const fieldError = (key: keyof ValidationErrors) =>
    errors[key] ? (
      <p className="mt-1.5 text-xs" style={{ color: 'var(--danger-text)' }}>{errors[key]}</p>
    ) : null;

  return (
    <AuthShell centered={false}>
      <div
        className="w-full rounded-2xl p-8"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-strong)' }}
      >
        {/* Heading */}
        <div className="mb-7">
          <h1 className="text-[1.375rem] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
            Register your fleet
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-soft)' }}>
            Submit your details for admin review and approval
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Error */}
          {formError && (
            <div
              className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-bg)', color: 'var(--danger-text)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="mt-0.5 h-4 w-4 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {formError}
            </div>
          )}

          {/* Section: Business */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-soft)' }}>
              Business
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                {fieldLabel('Business name')}
                <input value={form.name} onChange={set('name')} className="app-field" placeholder="Grand Transport Services" />
                {fieldError('name')}
              </div>
              <div>
                {fieldLabel('Owner name')}
                <input value={form.ownerName} onChange={set('ownerName')} className="app-field" placeholder="John Doe" />
                {fieldError('ownerName')}
              </div>
              <div className="sm:col-span-2">
                {fieldLabel('Address')}
                <input value={form.address} onChange={set('address')} className="app-field" placeholder="Main Mall Road, Murree" />
                {fieldError('address')}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* Section: Account */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-soft)' }}>
              Account
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                {fieldLabel('Email address')}
                <input type="email" value={form.email} onChange={set('email')} className="app-field" placeholder="fleet@example.com" />
                {fieldError('email')}
              </div>
              <div>
                {fieldLabel('Phone number')}
                <input value={form.phone} onChange={set('phone')} className="app-field" placeholder="+92 300 1234567" />
                {fieldError('phone')}
              </div>
              <div className="sm:col-span-2">
                {fieldLabel('Password')}
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  className="app-field"
                  placeholder="Min. 8 characters"
                />
                <PasswordStrengthIndicator password={form.password} />
                {fieldError('password')}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* Section: Identity */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-soft)' }}>
              Identity
            </p>
            <div>
              {fieldLabel('CNIC (13 digits, no dashes)')}
              <input
                value={form.cnic}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, cnic: e.target.value.replace(/\D/g, '').slice(0, 13) }))
                }
                className="app-field"
                placeholder="1234567890123"
              />
              {fieldError('cnic')}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary h-11 w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating account…
              </span>
            ) : 'Create vehicle account'}
          </button>
        </form>

        {/* Footer */}
        <p
          className="mt-6 pt-5 text-center text-sm"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--text-soft)' }}
        >
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default RegisterForm;
