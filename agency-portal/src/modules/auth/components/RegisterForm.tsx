import { DragEvent, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import AuthShell from './AuthShell';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { signup } from '../store/authSlice';
import {
  ValidationErrors,
  validateCnic,
  validateEmail,
  validateFilePresent,
  validateMinLength,
  validatePassword,
  validatePhone,
  validatePositiveNumber,
  validateRequired,
} from '../../../shared/utils/validators';

// ── Constants ────────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Account',  description: 'Login credentials' },
  { label: 'Owner',    description: 'Representative & ID' },
  { label: 'Business', description: 'Company details' },
  { label: 'Docs',     description: 'Supporting documents' },
];

const FIELD_OF_OPERATIONS = [
  'Domestic Tours', 'Inbound Tours', 'Outbound Tours',
  'Air Ticketing', 'Hotel Booking', 'Transport Services',
] as const;

const JURISDICTIONS = ['ICT', 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'AJK', 'Gilgit-Baltistan'] as const;

const LEGAL_ENTITY_OPTIONS = [
  { value: 'SOLE_PROPRIETOR', label: 'Sole Proprietor' },
  { value: 'PARTNERSHIP',     label: 'Partnership' },
  { value: 'COMPANY',         label: 'Company' },
] as const;

const IMAGE_MIME    = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const DOCUMENT_MIME = [...IMAGE_MIME, 'application/pdf'];
const MAX_SIZE      = 10 * 1024 * 1024;

type LegalEntityType   = typeof LEGAL_ENTITY_OPTIONS[number]['value'];
type Jurisdiction      = typeof JURISDICTIONS[number];
type FieldOfOperation  = typeof FIELD_OF_OPERATIONS[number];
type ImageFileField    = 'cnicImage' | 'ownerPhoto';
type DocumentFileField = 'licenseCertificate' | 'ntnCertificate' | 'businessRegistrationProof' | 'officeProof' | 'bankCertificate' | 'additionalSupportingDocument';
type FileFieldKey      = ImageFileField | DocumentFileField;

interface FormState {
  name: string; email: string; password: string;
  ownerName: string; phone: string; cnic: string;
  address: string; officeCity: string;
  jurisdiction: Jurisdiction | '';
  legalEntityType: LegalEntityType | '';
  license: string; ntn: string;
  secpRegistrationNumber: string; partnershipRegistrationNumber: string;
  fieldOfOperations: FieldOfOperation[];
  capitalAvailablePkr: string;
}

interface FileState {
  cnicImage: File | null; ownerPhoto: File | null;
  licenseCertificate: File | null; ntnCertificate: File | null;
  businessRegistrationProof: File | null; officeProof: File | null;
  bankCertificate: File | null; additionalSupportingDocument: File | null;
}

const initForm: FormState = {
  name: '', email: '', password: '', ownerName: '', phone: '', cnic: '',
  address: '', officeCity: '', jurisdiction: '', legalEntityType: '',
  license: '', ntn: '', secpRegistrationNumber: '', partnershipRegistrationNumber: '',
  fieldOfOperations: [], capitalAvailablePkr: '',
};

const initFiles: FileState = {
  cnicImage: null, ownerPhoto: null, licenseCertificate: null,
  ntnCertificate: null, businessRegistrationProof: null,
  officeProof: null, bankCertificate: null, additionalSupportingDocument: null,
};

// ── Shared sub-components ────────────────────────────────────────────────────

const Field = ({
  id, label, value, placeholder, type = 'text', error, required, onChange,
}: {
  id: string; label: string; value: string; placeholder: string;
  type?: string; error?: string; required?: boolean;
  onChange: (v: string) => void;
}) => (
  <div>
    <label htmlFor={id} className="auth-field-label">
      {label}{required && <span className="ml-0.5 text-[var(--danger-text)]">*</span>}
    </label>
    <input id={id} type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} className="app-field" />
    {error && <p className="mt-1 text-xs text-[var(--danger-text)]">{error}</p>}
  </div>
);

const Select = ({
  id, label, value, options, error, required, onChange,
}: {
  id: string; label: string; value: string;
  options: readonly { value: string; label: string }[];
  error?: string; required?: boolean; onChange: (v: string) => void;
}) => (
  <div>
    <label htmlFor={id} className="auth-field-label">
      {label}{required && <span className="ml-0.5 text-[var(--danger-text)]">*</span>}
    </label>
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="app-field">
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="mt-1 text-xs text-[var(--danger-text)]">{error}</p>}
  </div>
);

const DropZone = ({
  id, label, helperText, file, previewUrl, required, accept, error, onDrop, onFile,
}: {
  id: FileFieldKey; label: string; helperText: string;
  file: File | null; previewUrl?: string | null;
  required?: boolean; accept: string; error?: string;
  onDrop: (e: DragEvent<HTMLLabelElement>) => void;
  onFile: (f: File) => void;
}) => {
  const hasFile    = !!file;
  const isImage    = hasFile && IMAGE_MIME.includes(file!.type);

  return (
    <div>
      <label
        htmlFor={id}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`auth-drop-zone ${hasFile ? 'auth-drop-zone-done' : ''}`}
      >
        <input id={id} type="file" accept={accept} className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

        <div className="flex items-center gap-3">
          {/* Thumbnail / icon */}
          <div className="shrink-0">
            {previewUrl && isImage ? (
              <img src={previewUrl} alt={label}
                className="h-12 w-12 rounded-lg border border-[var(--border)] object-cover" />
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

// ── Step indicator ───────────────────────────────────────────────────────────
const StepBar = ({ current }: { current: number }) => (
  <div className="auth-steps mb-8">
    {STEPS.map((step, i) => (
      <div key={step.label} className="flex items-center" style={{ flex: 1 }}>
        <div className="auth-step-item">
          <div className={`auth-step-circle ${i === current ? 'auth-step-circle-active' : i < current ? 'auth-step-circle-done' : ''}`}>
            {i < current ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          <span className={`auth-step-label hidden sm:block ${i === current ? 'auth-step-label-active' : i < current ? 'auth-step-label-done' : ''}`}>
            {step.label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`auth-step-line ${i < current ? 'auth-step-line-done' : ''}`} />
        )}
      </div>
    ))}
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const RegisterForm = () => {
  const [step, setStep]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors]       = useState<ValidationErrors>({});
  const [form, setForm]           = useState<FormState>(initForm);
  const [files, setFiles]         = useState<FileState>(initFiles);
  const [previews, setPreviews]   = useState<Record<ImageFileField, string | null>>({ cnicImage: null, ownerPhoto: null });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isBusinessRegRequired = useMemo(
    () => form.legalEntityType === 'COMPANY' || form.legalEntityType === 'PARTNERSHIP',
    [form.legalEntityType],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleOp = (op: FieldOfOperation) =>
    setForm((f) => ({
      ...f,
      fieldOfOperations: f.fieldOfOperations.includes(op)
        ? f.fieldOfOperations.filter((x) => x !== op)
        : [...f.fieldOfOperations, op],
    }));

  const handleFile = (field: FileFieldKey, file: File) => {
    const allowed = field === 'cnicImage' || field === 'ownerPhoto' ? IMAGE_MIME : DOCUMENT_MIME;
    if (!allowed.includes(file.type)) { setFormError('Unsupported file type.'); return; }
    if (file.size > MAX_SIZE)         { setFormError('File must be 10 MB or smaller.'); return; }
    setFormError(null);
    setFiles((f) => ({ ...f, [field]: file }));
    if (field === 'cnicImage' || field === 'ownerPhoto') {
      setPreviews((p) => ({ ...p, [field]: URL.createObjectURL(file) }));
    }
  };

  const drop = (field: FileFieldKey) => (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(field, file);
  };

  const validate = (s: number): ValidationErrors => {
    const e: ValidationErrors = {};
    if (s === 0) {
      const n = validateMinLength(form.name, 'Agency name', 2); if (n) e.name = n;
      const em = validateEmail(form.email); if (em) e.email = em;
      const pw = validatePassword(form.password); if (pw) e.password = pw;
    }
    if (s === 1) {
      const on = validateMinLength(form.ownerName, 'Representative name', 2); if (on) e.ownerName = on;
      const ph = validatePhone(form.phone); if (ph) e.phone = ph;
      const cn = validateCnic(form.cnic); if (cn) e.cnic = cn;
      const ci = validateFilePresent(files.cnicImage, 'CNIC image'); if (ci) e.cnicImage = ci;
      const op = validateFilePresent(files.ownerPhoto, 'Owner photo'); if (op) e.ownerPhoto = op;
    }
    if (s === 2) {
      const ad = validateMinLength(form.address, 'Office address', 5); if (ad) e.address = ad;
      const oc = validateMinLength(form.officeCity, 'Office city', 2); if (oc) e.officeCity = oc;
      const jx = validateRequired(form.jurisdiction, 'Jurisdiction'); if (jx) e.jurisdiction = jx;
      const lt = validateRequired(form.legalEntityType, 'Legal entity type'); if (lt) e.legalEntityType = lt;
      const li = validateRequired(form.license, 'Tourism license number'); if (li) e.license = li;
      const nt = validateRequired(form.ntn, 'NTN'); if (nt) e.ntn = nt;
      const ca = validatePositiveNumber(form.capitalAvailablePkr, 'Capital', 400000); if (ca) e.capitalAvailablePkr = 'Minimum capital is PKR 400,000';
      if (form.fieldOfOperations.length === 0) e.fieldOfOperations = 'Select at least one';
      if (form.legalEntityType === 'COMPANY' && !form.secpRegistrationNumber.trim()) e.secpRegistrationNumber = 'Required';
      if (form.legalEntityType === 'PARTNERSHIP' && !form.partnershipRegistrationNumber.trim()) e.partnershipRegistrationNumber = 'Required';
    }
    if (s === 3) {
      const lc = validateFilePresent(files.licenseCertificate, 'Tourism license'); if (lc) e.licenseCertificate = lc;
      const nc = validateFilePresent(files.ntnCertificate, 'NTN certificate'); if (nc) e.ntnCertificate = nc;
      const of_ = validateFilePresent(files.officeProof, 'Office proof'); if (of_) e.officeProof = of_;
      const bc = validateFilePresent(files.bankCertificate, 'Bank certificate'); if (bc) e.bankCertificate = bc;
      if (isBusinessRegRequired) {
        const br = validateFilePresent(files.businessRegistrationProof, 'Business registration proof');
        if (br) e.businessRegistrationProof = br;
      }
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => { setErrors({}); setFormError(null); setStep((s) => Math.max(s - 1, 0)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    for (let i = 0; i < STEPS.length; i++) {
      const errs = validate(i);
      if (Object.keys(errs).length > 0) { setErrors(errs); setStep(i); return; }
    }
    setLoading(true);
    try {
      await dispatch(signup({
        email: form.email.trim(), password: form.password,
        name: form.name.trim(), phone: form.phone.trim(),
        address: form.address.trim(), officeCity: form.officeCity.trim(),
        jurisdiction: form.jurisdiction as Jurisdiction,
        legalEntityType: form.legalEntityType as LegalEntityType,
        license: form.license.trim(), ntn: form.ntn.trim(),
        ownerName: form.ownerName.trim(), cnic: form.cnic,
        fieldOfOperations: form.fieldOfOperations,
        capitalAvailablePkr: Number(form.capitalAvailablePkr),
        cnicImage: files.cnicImage!,
        ownerPhoto: files.ownerPhoto!,
        licenseCertificate: files.licenseCertificate!,
        ntnCertificate: files.ntnCertificate!,
        officeProof: files.officeProof!,
        bankCertificate: files.bankCertificate!,
        businessRegistrationProof: files.businessRegistrationProof || undefined,
        additionalSupportingDocument: files.additionalSupportingDocument || undefined,
        secpRegistrationNumber: form.secpRegistrationNumber.trim() || undefined,
        partnershipRegistrationNumber: form.partnershipRegistrationNumber.trim() || undefined,
      }) as any).unwrap();
      navigate('/pending-approval', { state: { email: form.email, name: form.name } });
    } catch (err: any) {
      setFormError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell variant="register" maxWidth="42rem">
      <div className="auth-card">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[1.375rem] font-semibold tracking-tight text-[var(--text)]">
            Register agency
          </h1>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            {STEPS[step].description} — step {step + 1} of {STEPS.length}
          </p>
        </div>

        <StepBar current={step} />

        <form onSubmit={handleSubmit} noValidate>
          {/* Global error */}
          {formError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="mt-0.5 h-4 w-4 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {formError}
            </div>
          )}

          {/* ── Step 0 — Account ──────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-4">
              <Field id="name" label="Agency name" value={form.name} placeholder="Example Travels" required error={errors.name} onChange={(v) => set('name', v)} />
              <Field id="email" label="Business email" type="email" value={form.email} placeholder="agency@example.com" required error={errors.email} onChange={(v) => set('email', v)} />
              <div>
                <Field id="password" label="Password" type="password" value={form.password} placeholder="Create a strong password" required error={errors.password} onChange={(v) => set('password', v)} />
                <PasswordStrengthIndicator password={form.password} />
              </div>
            </div>
          )}

          {/* ── Step 1 — Owner ───────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="ownerName" label="Representative name" value={form.ownerName} placeholder="Full name" required error={errors.ownerName} onChange={(v) => set('ownerName', v)} />
                <Field id="phone" label="Phone" value={form.phone} placeholder="+92 300 1234567" required error={errors.phone} onChange={(v) => set('phone', v)} />
              </div>
              <div className="max-w-xs">
                <Field id="cnic" label="CNIC" value={form.cnic} placeholder="1234567890123" required error={errors.cnic} onChange={(v) => set('cnic', v.replace(/\D/g, '').slice(0, 13))} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <DropZone id="cnicImage" label="CNIC image" file={files.cnicImage} previewUrl={previews.cnicImage} helperText="JPG, PNG, or WebP" required accept="image/jpeg,image/png,image/jpg,image/webp" error={errors.cnicImage} onDrop={drop('cnicImage')} onFile={(f) => handleFile('cnicImage', f)} />
                <DropZone id="ownerPhoto" label="Owner photo" file={files.ownerPhoto} previewUrl={previews.ownerPhoto} helperText="JPG, PNG, or WebP" required accept="image/jpeg,image/png,image/jpg,image/webp" error={errors.ownerPhoto} onDrop={drop('ownerPhoto')} onFile={(f) => handleFile('ownerPhoto', f)} />
              </div>
            </div>
          )}

          {/* ── Step 2 — Business ────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <Field id="address" label="Office address" value={form.address} placeholder="Full office address" required error={errors.address} onChange={(v) => set('address', v)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="officeCity" label="City" value={form.officeCity} placeholder="Islamabad" required error={errors.officeCity} onChange={(v) => set('officeCity', v)} />
                <Select id="jurisdiction" label="Jurisdiction" value={form.jurisdiction} options={JURISDICTIONS.map((j) => ({ value: j, label: j }))} required error={errors.jurisdiction} onChange={(v) => set('jurisdiction', v as Jurisdiction | '')} />
                <Select id="legalEntityType" label="Legal entity" value={form.legalEntityType} options={LEGAL_ENTITY_OPTIONS} required error={errors.legalEntityType} onChange={(v) => set('legalEntityType', v as LegalEntityType | '')} />
                <Field id="license" label={form.jurisdiction ? `${form.jurisdiction} tourism license` : 'Tourism license no.'} value={form.license} placeholder="Regulator-issued number" required error={errors.license} onChange={(v) => set('license', v)} />
                <Field id="ntn" label="NTN" value={form.ntn} placeholder="National Tax Number" required error={errors.ntn} onChange={(v) => set('ntn', v)} />
                <Field id="capitalAvailablePkr" label="Capital available (PKR)" value={form.capitalAvailablePkr} placeholder="400000" required error={errors.capitalAvailablePkr} onChange={(v) => set('capitalAvailablePkr', v.replace(/[^\d]/g, ''))} />
                {form.legalEntityType === 'COMPANY' && (
                  <Field id="secpRegistrationNumber" label="SECP registration no." value={form.secpRegistrationNumber} placeholder="SECP number" required error={errors.secpRegistrationNumber} onChange={(v) => set('secpRegistrationNumber', v)} />
                )}
                {form.legalEntityType === 'PARTNERSHIP' && (
                  <Field id="partnershipRegistrationNumber" label="Partnership registration no." value={form.partnershipRegistrationNumber} placeholder="Partnership number" required error={errors.partnershipRegistrationNumber} onChange={(v) => set('partnershipRegistrationNumber', v)} />
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="auth-field-label mb-0">Field of operations <span className="text-[var(--danger-text)]">*</span></label>
                  <span className="text-xs text-[var(--text-soft)]">{form.fieldOfOperations.length} selected</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FIELD_OF_OPERATIONS.map((op) => (
                    <button key={op} type="button" onClick={() => toggleOp(op)}
                      className={`auth-toggle ${form.fieldOfOperations.includes(op) ? 'auth-toggle-active' : ''}`}>
                      {op}
                    </button>
                  ))}
                </div>
                {errors.fieldOfOperations && <p className="mt-1.5 text-xs text-[var(--danger-text)]">{errors.fieldOfOperations}</p>}
              </div>
            </div>
          )}

          {/* ── Step 3 — Docs ────────────────────────────────── */}
          {step === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <DropZone id="licenseCertificate" label="Tourism license certificate" file={files.licenseCertificate} helperText="PDF, JPG, PNG, WebP" required accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" error={errors.licenseCertificate} onDrop={drop('licenseCertificate')} onFile={(f) => handleFile('licenseCertificate', f)} />
              <DropZone id="ntnCertificate" label="NTN certificate" file={files.ntnCertificate} helperText="PDF, JPG, PNG, WebP" required accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" error={errors.ntnCertificate} onDrop={drop('ntnCertificate')} onFile={(f) => handleFile('ntnCertificate', f)} />
              <DropZone id="officeProof" label="Office proof" file={files.officeProof} helperText="Ownership or rent proof" required accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" error={errors.officeProof} onDrop={drop('officeProof')} onFile={(f) => handleFile('officeProof', f)} />
              <DropZone id="bankCertificate" label="Bank certificate" file={files.bankCertificate} helperText="Business bank proof" required accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" error={errors.bankCertificate} onDrop={drop('bankCertificate')} onFile={(f) => handleFile('bankCertificate', f)} />
              <DropZone id="businessRegistrationProof" label="Business registration proof" file={files.businessRegistrationProof} helperText={isBusinessRegRequired ? 'Required for company/partnership' : 'Optional'} required={isBusinessRegRequired} accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" error={errors.businessRegistrationProof} onDrop={drop('businessRegistrationProof')} onFile={(f) => handleFile('businessRegistrationProof', f)} />
              <DropZone id="additionalSupportingDocument" label="Additional document" file={files.additionalSupportingDocument} helperText="Optional extra proof" accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" onDrop={drop('additionalSupportingDocument')} onFile={(f) => handleFile('additionalSupportingDocument', f)} />
            </div>
          )}

          {/* Navigation */}
          <div className="mt-7 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button type="button" onClick={back} className="app-btn-secondary app-btn-md px-5">
                ← Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="app-btn-primary app-btn-md px-6">
                Continue →
              </button>
            ) : (
              <button type="submit" disabled={loading} className="app-btn-primary app-btn-md px-6 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Submitting…' : 'Submit for review'}
              </button>
            )}
          </div>

          <p className="mt-5 border-t border-[var(--border)] pt-5 text-center text-sm text-[var(--text-soft)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
};

export default RegisterForm;
