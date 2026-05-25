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
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    ownerName: '',
    phone: '',
    cnic: '',
    address: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateAll = (): ValidationErrors => {
    const nextErrors: ValidationErrors = {};

    const nameError = validateMinLength(form.name, 'Business name', 2);
    if (nameError) nextErrors.name = nameError;

    const emailError = validateEmail(form.email);
    if (emailError) nextErrors.email = emailError;

    const passwordError = validatePassword(form.password);
    if (passwordError) nextErrors.password = passwordError;

    const ownerNameError = validateMinLength(form.ownerName, 'Owner name', 2);
    if (ownerNameError) nextErrors.ownerName = ownerNameError;

    const phoneError = validatePhone(form.phone);
    if (phoneError) nextErrors.phone = phoneError;

    const cnicError = validateCnic(form.cnic);
    if (cnicError) nextErrors.cnic = cnicError;

    const addressError = validateMinLength(form.address, 'Address', 5);
    if (addressError) nextErrors.address = addressError;

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateAll();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await dispatch(
        signup({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          ownerName: form.ownerName.trim(),
          cnic: form.cnic,
        }) as any,
      ).unwrap();

      navigate('/pending-approval', {
        state: { email: form.email.trim(), name: form.name.trim() },
      });
    } catch (error: any) {
      setFormError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Vehicle Portal"
      title="Vehicle Partner Signup"
      subtitle="Submit your account details for admin approval."
    >
      <div className="app-card px-6 py-6 md:px-8 md:py-8">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="rounded-2xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Business Name</label>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="app-field"
              placeholder="Grand Transport Services"
            />
            {errors.name && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Owner Name</label>
            <input
              value={form.ownerName}
              onChange={(event) => setForm((current) => ({ ...current, ownerName: event.target.value }))}
              className="app-field"
              placeholder="John Doe"
            />
            {errors.ownerName && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.ownerName}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="app-field"
              placeholder="vehicle@example.com"
            />
            {errors.email && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="app-field"
              placeholder="Create password"
            />
            <PasswordStrengthIndicator password={form.password} />
            {errors.password && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.password}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Phone Number</label>
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="app-field"
              placeholder="+92 300 1234567"
            />
            {errors.phone && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.phone}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Address</label>
            <input
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              className="app-field"
              placeholder="Main Mall Road, Murree"
            />
            {errors.address && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.address}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">CNIC</label>
            <input
              value={form.cnic}
              onChange={(event) => setForm((current) => ({ ...current, cnic: event.target.value.replace(/\D/g, '').slice(0, 13) }))}
              className="app-field"
              placeholder="1234567890123"
            />
            {errors.cnic && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.cnic}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary h-12 w-full px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Vehicle Account'}
          </button>

          <div className="border-t border-[var(--border)] pt-5 text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--primary)]">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
};

export default RegisterForm;
