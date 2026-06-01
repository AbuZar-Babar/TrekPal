import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { useTheme } from '../../../shared/theme/ThemeProvider';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Owner name is required'),
  hotelName: z.string().min(2, 'Hotel name is required'),
  hotelAddress: z.string().min(10, 'Complete address is required'),
  hotelDescription: z.string().min(20, 'Description should be at least 20 characters'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

const validateUploadFile = (file: File, label: string): string | null => {
  if (!allowedMimeTypes.has(file.type)) return `${label} must be PDF, JPEG, PNG, or WebP`;
  if (file.size > 10 * 1024 * 1024) return `${label} must be smaller than 10 MB`;
  return null;
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationImage, setLocationImage] = useState<File | null>(null);
  const [businessDoc, setBusinessDoc] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (!locationImage || !businessDoc) {
      setError('Please upload both location image and business document.');
      return;
    }
    const locErr = validateUploadFile(locationImage, 'Location image');
    if (locErr) { setError(locErr); return; }
    const docErr = validateUploadFile(businessDoc, 'Business document');
    if (docErr) { setError(docErr); return; }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('name', data.hotelName);
    formData.append('phone', data.phoneNumber);
    formData.append('address', data.hotelAddress);
    formData.append('location', data.hotelAddress.split(',').pop()?.trim() || data.hotelAddress);
    formData.append('description', data.hotelDescription);
    formData.append('locationImage', locationImage);
    formData.append('businessDoc', businessDoc);

    try {
      await api.post('/auth/register/hotel', formData);
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      if (!err?.response) {
        setError('Unable to reach server. Please check the backend is running.');
        return;
      }
      const details = err?.response?.data?.details;
      if (Array.isArray(details) && details.length > 0) {
        setError(details.map((d: any) => d?.message).filter(Boolean).join(', '));
        return;
      }
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen
  if (isSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-body auth-body-center">
          <div style={{ width: '100%', maxWidth: '28rem' }}>
            <div className="auth-card text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tp-success-bg)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7 text-[var(--tp-success-text)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[var(--tp-text)]">Application submitted!</h2>
              <p className="mt-2 text-sm text-[var(--tp-text-soft)]">
                Your hotel registration has been sent to the TrekPal admin for review. You'll be able to sign in once approved.
              </p>
              <p className="mt-4 text-xs text-[var(--tp-text-soft)]">Redirecting to login…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Topbar */}
      <header className="auth-topbar">
        <div className="auth-logo">
          <span className="auth-logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3 21h18M5 21V7h14v14M9 11h2m2 0h2M9 15h2m2 0h2" />
            </svg>
          </span>
          <span className="auth-logo-name">TrekPal</span>
          <span className="auth-logo-tag">Hotel</span>
        </div>

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

      {/* Body */}
      <div className="auth-body">
        <div style={{ width: '100%', maxWidth: '42rem', margin: '0 auto', padding: '2rem 0' }}>
          <div className="auth-card">
            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-[1.375rem] font-semibold tracking-tight text-[var(--tp-text)]">
                Register your hotel
              </h1>
              <p className="mt-1 text-sm text-[var(--tp-text-soft)]">
                Join TrekPal and reach thousands of travelers
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-[var(--tp-danger-bg)] bg-[var(--tp-danger-bg)] px-4 py-3 text-sm text-[var(--tp-danger-text)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="mt-0.5 h-4 w-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Section: Account */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--tp-text-soft)]">Account</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="auth-field-label">Owner name</label>
                    <input {...register('name')} className="input-field" placeholder="John Doe" />
                    {errors.name && <p className="mt-1 text-xs text-[var(--tp-danger-text)]">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="auth-field-label">Email address</label>
                    <input {...register('email')} type="email" className="input-field" placeholder="john@example.com" />
                    {errors.email && <p className="mt-1 text-xs text-[var(--tp-danger-text)]">{errors.email.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="auth-field-label">Password</label>
                    <input {...register('password')} type="password" className="input-field" placeholder="Min. 8 characters" />
                    {errors.password && <p className="mt-1 text-xs text-[var(--tp-danger-text)]">{errors.password.message}</p>}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--tp-border)]" />

              {/* Section: Hotel */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--tp-text-soft)]">Hotel details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="auth-field-label">Hotel name</label>
                    <input {...register('hotelName')} className="input-field" placeholder="Grand Luxury Hotel" />
                    {errors.hotelName && <p className="mt-1 text-xs text-[var(--tp-danger-text)]">{errors.hotelName.message}</p>}
                  </div>
                  <div>
                    <label className="auth-field-label">Phone number</label>
                    <input {...register('phoneNumber')} className="input-field" placeholder="+92 300 1234567" />
                    {errors.phoneNumber && <p className="mt-1 text-xs text-[var(--tp-danger-text)]">{errors.phoneNumber.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="auth-field-label">Address</label>
                    <input {...register('hotelAddress')} className="input-field" placeholder="Main Mall Road, Murree, Pakistan" />
                    {errors.hotelAddress && <p className="mt-1 text-xs text-[var(--tp-danger-text)]">{errors.hotelAddress.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="auth-field-label">Description</label>
                    <textarea
                      {...register('hotelDescription')}
                      rows={3}
                      className="input-field resize-none"
                      placeholder="Tell us about your hotel, amenities, and surroundings…"
                    />
                    {errors.hotelDescription && <p className="mt-1 text-xs text-[var(--tp-danger-text)]">{errors.hotelDescription.message}</p>}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--tp-border)]" />

              {/* Section: Documents */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--tp-text-soft)]">Documents</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Location image */}
                  <div>
                    <label className="auth-field-label">Exterior / location photo</label>
                    <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${locationImage ? 'border-[var(--tp-success-text)] bg-[var(--tp-success-bg)]' : 'border-[var(--tp-border)] hover:border-[var(--tp-primary)]'}`}>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => setLocationImage(e.target.files?.[0] || null)}
                      />
                      {locationImage ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6 text-[var(--tp-success-text)]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs font-medium text-[var(--tp-success-text)] break-all">{locationImage.name}</span>
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6 text-[var(--tp-text-soft)]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4a3 3 0 014 0l4 4m-4-4v8m6-10V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2" />
                          </svg>
                          <span className="text-xs text-[var(--tp-text-soft)]">Click to upload</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Business doc */}
                  <div>
                    <label className="auth-field-label">Business registration (PDF/Image)</label>
                    <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${businessDoc ? 'border-[var(--tp-success-text)] bg-[var(--tp-success-bg)]' : 'border-[var(--tp-border)] hover:border-[var(--tp-primary)]'}`}>
                      <input
                        type="file"
                        accept=".pdf,image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(e) => setBusinessDoc(e.target.files?.[0] || null)}
                      />
                      {businessDoc ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6 text-[var(--tp-success-text)]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs font-medium text-[var(--tp-success-text)] break-all">{businessDoc.name}</span>
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6 text-[var(--tp-text-soft)]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h3a2 2 0 012 2v14a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xs text-[var(--tp-text-soft)]">Click to upload</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary h-11 w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Submitting…
                  </span>
                ) : 'Create hotel account'}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 border-t border-[var(--tp-border)] pt-5 text-center text-sm text-[var(--tp-text-soft)]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[var(--tp-primary)] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
