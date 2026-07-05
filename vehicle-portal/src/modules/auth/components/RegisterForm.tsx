import React, { useState } from 'react';
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

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const DOCUMENT_MIME = [...IMAGE_MIME, 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

type FileFieldKey =
  | 'cnicImage'
  | 'ownerPhoto'
  | 'licenseCertificate'
  | 'ntnCertificate'
  | 'officeProof'
  | 'bankCertificate'
  | 'additionalSupportingDocument';

const DropZone = ({
  id,
  label,
  helperText,
  file,
  previewUrl,
  required,
  accept,
  error,
  onDrop,
  onFile,
}: {
  id: FileFieldKey;
  label: string;
  helperText: string;
  file: File | null;
  previewUrl?: string | null;
  required?: boolean;
  accept: string;
  error?: string;
  onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  onFile: (f: File) => void;
}) => {
  const hasFile = !!file;
  const isImage = hasFile && IMAGE_MIME.includes(file!.type);

  return (
    <div>
      <label
        htmlFor={id}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`auth-drop-zone ${hasFile ? 'auth-drop-zone-done' : ''}`}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />

        <div className="flex items-center gap-3">
          {/* Thumbnail / icon */}
          <div className="shrink-0">
            {previewUrl && isImage ? (
              <img
                src={previewUrl}
                alt={label}
                className="h-12 w-12 rounded-lg border border-[var(--border)] object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text-soft)]">
                {hasFile ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-[var(--primary)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                )}
              </div>
            )}
          </div>

          {/* Text */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[var(--text)]">{label}</span>
              {required && (
                <span className="rounded-full bg-[var(--danger-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--danger-text)]">
                  Required
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-soft)]">
              {hasFile ? file!.name : helperText}
            </p>
          </div>
        </div>
      </label>
      {error && <p className="mt-1 text-xs text-[var(--danger-text)]">{error}</p>}
    </div>
  );
};

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
    officeCity: '',
    license: '',
    ntn: '',
  });

  const [files, setFiles] = useState<{
    cnicImage: File | null;
    ownerPhoto: File | null;
    licenseCertificate: File | null;
    ntnCertificate: File | null;
    officeProof: File | null;
    bankCertificate: File | null;
    additionalSupportingDocument: File | null;
  }>({
    cnicImage: null,
    ownerPhoto: null,
    licenseCertificate: null,
    ntnCertificate: null,
    officeProof: null,
    bankCertificate: null,
    additionalSupportingDocument: null,
  });

  const [previews, setPreviews] = useState<Record<string, string | null>>({
    cnicImage: null,
    ownerPhoto: null,
  });

  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleFile = (field: FileFieldKey, file: File) => {
    const isImg = field === 'cnicImage' || field === 'ownerPhoto';
    const allowed = isImg ? IMAGE_MIME : DOCUMENT_MIME;
    if (!allowed.includes(file.type)) {
      setFormError(`Unsupported file type for ${field === 'cnicImage' ? 'CNIC' : field === 'ownerPhoto' ? 'Owner Photo' : 'Document'}.`);
      return;
    }
    if (file.size > MAX_SIZE) {
      setFormError('File must be 10 MB or smaller.');
      return;
    }
    setFormError(null);
    setFiles((f) => ({ ...f, [field]: file }));
    if (isImg) {
      setPreviews((p) => ({ ...p, [field]: URL.createObjectURL(file) }));
    }
  };

  const drop = (field: FileFieldKey) => (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(field, file);
  };

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

    // Validate required files
    if (!files.cnicImage) {
      next.cnicImage = 'CNIC image is required';
    }
    if (!files.ownerPhoto) {
      next.ownerPhoto = 'Owner photo is required';
    }
    if (!files.licenseCertificate) {
      next.licenseCertificate = 'License / Driving certificate is required';
    }

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
          officeCity: form.officeCity.trim() || undefined,
          license:    form.license.trim() || undefined,
          ntn:        form.ntn.trim() || undefined,
          cnicImage: files.cnicImage || undefined,
          ownerPhoto: files.ownerPhoto || undefined,
          licenseCertificate: files.licenseCertificate || undefined,
          ntnCertificate: files.ntnCertificate || undefined,
          officeProof: files.officeProof || undefined,
          bankCertificate: files.bankCertificate || undefined,
          additionalSupportingDocument: files.additionalSupportingDocument || undefined,
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

  const fieldLabel = (text: string, required?: boolean) => (
    <label className="block mb-1.5 text-[0.8125rem] font-medium" style={{ color: 'var(--text-muted)' }}>
      {text}
      {required && <span className="ml-0.5" style={{ color: 'var(--danger-text)' }}>*</span>}
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
            Submit your details and documents for admin review and approval
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

          {/* Section: Business Details */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-soft)' }}>
              Business Details
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                {fieldLabel('Business name', true)}
                <input value={form.name} onChange={set('name')} className="app-field" placeholder="Grand Transport Services" />
                {fieldError('name')}
              </div>
              <div>
                {fieldLabel('Owner name', true)}
                <input value={form.ownerName} onChange={set('ownerName')} className="app-field" placeholder="John Doe" />
                {fieldError('ownerName')}
              </div>
              <div>
                {fieldLabel('Office city')}
                <input value={form.officeCity} onChange={set('officeCity')} className="app-field" placeholder="Murree" />
                {fieldError('officeCity')}
              </div>
              <div>
                {fieldLabel('License / Driving license number')}
                <input value={form.license} onChange={set('license')} className="app-field" placeholder="DL-12345-ABC" />
                {fieldError('license')}
              </div>
              <div className="sm:col-span-2">
                {fieldLabel('NTN (Optional)')}
                <input value={form.ntn} onChange={set('ntn')} className="app-field" placeholder="1234567-8" />
                {fieldError('ntn')}
              </div>
              <div className="sm:col-span-2">
                {fieldLabel('Office Address', true)}
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
                {fieldLabel('Email address', true)}
                <input type="email" value={form.email} onChange={set('email')} className="app-field" placeholder="fleet@example.com" />
                {fieldError('email')}
              </div>
              <div>
                {fieldLabel('Phone number', true)}
                <input value={form.phone} onChange={set('phone')} className="app-field" placeholder="+92 300 1234567" />
                {fieldError('phone')}
              </div>
              <div className="sm:col-span-2">
                {fieldLabel('Password', true)}
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
              Identity & Documents
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                {fieldLabel('CNIC (13 digits, no dashes)', true)}
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

              <DropZone
                id="cnicImage"
                label="CNIC Image"
                helperText="JPG, PNG, or WebP"
                file={files.cnicImage}
                previewUrl={previews.cnicImage}
                required
                accept="image/jpeg,image/png,image/jpg,image/webp"
                error={errors.cnicImage}
                onDrop={drop('cnicImage')}
                onFile={(f) => handleFile('cnicImage', f)}
              />

              <DropZone
                id="ownerPhoto"
                label="Owner Photo"
                helperText="JPG, PNG, or WebP"
                file={files.ownerPhoto}
                previewUrl={previews.ownerPhoto}
                required
                accept="image/jpeg,image/png,image/jpg,image/webp"
                error={errors.ownerPhoto}
                onDrop={drop('ownerPhoto')}
                onFile={(f) => handleFile('ownerPhoto', f)}
              />

              <DropZone
                id="licenseCertificate"
                label="Driving / Business License"
                helperText="PDF, JPG, PNG, or WebP"
                file={files.licenseCertificate}
                required
                accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                error={errors.licenseCertificate}
                onDrop={drop('licenseCertificate')}
                onFile={(f) => handleFile('licenseCertificate', f)}
              />

              <DropZone
                id="ntnCertificate"
                label="NTN Certificate"
                helperText="PDF, JPG, PNG, or WebP (Optional)"
                file={files.ntnCertificate}
                accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                error={errors.ntnCertificate}
                onDrop={drop('ntnCertificate')}
                onFile={(f) => handleFile('ntnCertificate', f)}
              />

              <DropZone
                id="officeProof"
                label="Office Ownership / Rent Proof"
                helperText="PDF, JPG, PNG, or WebP (Optional)"
                file={files.officeProof}
                accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                error={errors.officeProof}
                onDrop={drop('officeProof')}
                onFile={(f) => handleFile('officeProof', f)}
              />

              <DropZone
                id="bankCertificate"
                label="Bank Certificate"
                helperText="PDF, JPG, PNG, or WebP (Optional)"
                file={files.bankCertificate}
                accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                error={errors.bankCertificate}
                onDrop={drop('bankCertificate')}
                onFile={(f) => handleFile('bankCertificate', f)}
              />

              <div className="sm:col-span-2">
                <DropZone
                  id="additionalSupportingDocument"
                  label="Additional Supporting Document"
                  helperText="PDF, JPG, PNG, or WebP (Optional)"
                  file={files.additionalSupportingDocument}
                  accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                  error={errors.additionalSupportingDocument}
                  onDrop={drop('additionalSupportingDocument')}
                  onFile={(f) => handleFile('additionalSupportingDocument', f)}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary h-11 w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
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
