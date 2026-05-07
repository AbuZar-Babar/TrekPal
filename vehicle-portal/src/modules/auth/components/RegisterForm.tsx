import { DragEvent, useState } from 'react';
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

const FIELD_OF_OPERATIONS = [
  'Domestic Tours',
  'Inbound Tours',
  'Outbound Tours',
  'Air Ticketing',
  'Hotel Booking',
  'Transport Services',
] as const;
const JURISDICTIONS = ['ICT', 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'AJK', 'Gilgit-Baltistan'] as const;
const LEGAL_ENTITY_OPTIONS = [
  { value: 'SOLE_PROPRIETOR', label: 'Sole Proprietor' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'COMPANY', label: 'Company' },
] as const;
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type LegalEntityType = typeof LEGAL_ENTITY_OPTIONS[number]['value'];
type Jurisdiction = typeof JURISDICTIONS[number];
type FieldOfOperation = typeof FIELD_OF_OPERATIONS[number];
type FileFieldKey = 'cnicImage';

interface FormState {
  name: string;
  email: string;
  password: string;
  ownerName: string;
  phone: string;
  cnic: string;
  address: string;
  officeCity: string;
  jurisdiction: Jurisdiction | '';
  legalEntityType: LegalEntityType | '';
  license: string;
  ntn: string;
  secpRegistrationNumber: string;
  partnershipRegistrationNumber: string;
  fieldOfOperations: FieldOfOperation[];
  capitalAvailablePkr: string;
}

interface FileState {
  cnicImage: File | null;
}

const initialFormState: FormState = {
  name: '',
  email: '',
  password: '',
  ownerName: '',
  phone: '',
  cnic: '',
  address: '',
  officeCity: '',
  jurisdiction: '',
  legalEntityType: '',
  license: '',
  ntn: '',
  secpRegistrationNumber: '',
  partnershipRegistrationNumber: '',
  fieldOfOperations: [],
  capitalAvailablePkr: '',
};

const initialFileState: FileState = {
  cnicImage: null,
};

const labelForJurisdiction = (jurisdiction: Jurisdiction | '') =>
  jurisdiction ? `${jurisdiction} Tourism License Number` : 'Tourism License Number';

const TextInput = ({
  id,
  label,
  value,
  placeholder,
  type = 'text',
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  error?: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-800">{label}</label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#0b8ccf]"
      placeholder={placeholder}
    />
    {error && <p className="mt-2 text-sm text-[var(--danger-text)]">{error}</p>}
  </div>
);

const SelectInput = ({
  id,
  label,
  value,
  options,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  error?: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-800">{label}</label>
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#0b8ccf]"
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {error && <p className="mt-2 text-sm text-[var(--danger-text)]">{error}</p>}
  </div>
);

const FileUploadCard = ({
  id,
  label,
  file,
  helperText,
  error,
  onDrop,
  onFileChange,
}: {
  id: FileFieldKey;
  label: string;
  file: File | null;
  helperText: string;
  error?: string;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
  onFileChange: (file: File) => void;
}) => (
  <div>
    <label
      htmlFor={id}
      onDrop={onDrop}
      onDragOver={(event) => event.preventDefault()}
      className="block cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 transition-all hover:border-[#0b8ccf]"
    >
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];
          if (selectedFile) onFileChange(selectedFile);
        }}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{label}</span>
            <span className="text-xs text-red-500">*</span>
          </div>
          <p className="text-xs text-slate-500">{helperText}</p>
          <p className="mt-2 truncate text-xs text-slate-500">{file ? file.name : 'Upload file'}</p>
        </div>
      </div>
    </label>
    {error && <p className="mt-2 text-sm text-[var(--danger-text)]">{error}</p>}
  </div>
);

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [form, setForm] = useState<FormState>(initialFormState);
  const [files, setFiles] = useState<FileState>(initialFileState);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleFieldOperation = (value: FieldOfOperation) => {
    setForm((current) => ({
      ...current,
      fieldOfOperations: current.fieldOfOperations.includes(value)
        ? current.fieldOfOperations.filter((item) => item !== value)
        : [...current.fieldOfOperations, value],
    }));
  };

  const handleFileSelect = (field: FileFieldKey, file: File) => {
    if (!IMAGE_MIME_TYPES.includes(file.type)) {
      setFormError('CNIC image must be JPG, PNG, or WebP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFormError('CNIC image must be 10MB or smaller.');
      return;
    }

    setFormError(null);
    setFiles((current) => ({ ...current, [field]: file }));
  };

  const handleDrop = (field: FileFieldKey) => (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileSelect(field, file);
  };

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

    const addressError = validateMinLength(form.address, 'Office address', 5);
    if (addressError) nextErrors.address = addressError;

    const officeCityError = validateMinLength(form.officeCity, 'Office city', 2);
    if (officeCityError) nextErrors.officeCity = officeCityError;

    const jurisdictionError = validateRequired(form.jurisdiction, 'Jurisdiction');
    if (jurisdictionError) nextErrors.jurisdiction = jurisdictionError;

    const entityError = validateRequired(form.legalEntityType, 'Legal entity type');
    if (entityError) nextErrors.legalEntityType = entityError;

    const licenseError = validateRequired(form.license, 'Tourism license number');
    if (licenseError) nextErrors.license = licenseError;

    const ntnError = validateRequired(form.ntn, 'NTN');
    if (ntnError) nextErrors.ntn = ntnError;

    const capitalError = validatePositiveNumber(form.capitalAvailablePkr, 'Capital', 400000);
    if (capitalError) nextErrors.capitalAvailablePkr = 'Capital must be at least 400000';

    if (form.fieldOfOperations.length === 0) {
      nextErrors.fieldOfOperations = 'Select at least one field of operation';
    }

    if (form.legalEntityType === 'COMPANY' && !form.secpRegistrationNumber.trim()) {
      nextErrors.secpRegistrationNumber = 'SECP registration number is required';
    }

    if (form.legalEntityType === 'PARTNERSHIP' && !form.partnershipRegistrationNumber.trim()) {
      nextErrors.partnershipRegistrationNumber = 'Partnership registration number is required';
    }

    const cnicImageError = validateFilePresent(files.cnicImage, 'CNIC image');
    if (cnicImageError) nextErrors.cnicImage = cnicImageError;

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
          officeCity: form.officeCity.trim(),
          jurisdiction: form.jurisdiction as Jurisdiction,
          legalEntityType: form.legalEntityType as LegalEntityType,
          license: form.license.trim(),
          ntn: form.ntn.trim(),
          ownerName: form.ownerName.trim(),
          cnic: form.cnic,
          fieldOfOperations: form.fieldOfOperations,
          capitalAvailablePkr: Number(form.capitalAvailablePkr),
          cnicImage: files.cnicImage!,
          secpRegistrationNumber: form.secpRegistrationNumber.trim() || undefined,
          partnershipRegistrationNumber: form.partnershipRegistrationNumber.trim() || undefined,
        }) as any,
      ).unwrap();

      navigate('/pending-approval', { state: { email: form.email, name: form.name } });
    } catch (error: any) {
      setFormError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Vehicle Portal"
      title="Vehicle Partner Program"
      subtitle="Register your vehicle business and reach thousands of travelers"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm md:px-8 md:py-8">
        <form onSubmit={handleSubmit} className="space-y-7" noValidate>
          {formError && (
            <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
              {formError}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <h3 className="text-xl font-semibold text-slate-900">Owner Information</h3>
              <TextInput id="ownerName" label="Full Name" value={form.ownerName} placeholder="John Doe" error={errors.ownerName} onChange={(value) => updateForm('ownerName', value)} />
              <TextInput id="email" label="Email Address" type="email" value={form.email} placeholder="john@example.com" error={errors.email} onChange={(value) => updateForm('email', value)} />
              <TextInput id="password" label="Password" type="password" value={form.password} placeholder="Create password" error={errors.password} onChange={(value) => updateForm('password', value)} />
              <PasswordStrengthIndicator password={form.password} />
              <TextInput id="phone" label="Phone Number" value={form.phone} placeholder="+92 300 1234567" error={errors.phone} onChange={(value) => updateForm('phone', value)} />
            </div>

            <div className="space-y-5">
              <h3 className="text-xl font-semibold text-slate-900">Business Details</h3>
              <TextInput id="name" label="Business Name" value={form.name} placeholder="Grand Transport Services" error={errors.name} onChange={(value) => updateForm('name', value)} />
              <TextInput id="address" label="Address" value={form.address} placeholder="Main Mall Road, Murree" error={errors.address} onChange={(value) => updateForm('address', value)} />
              <TextInput id="officeCity" label="City" value={form.officeCity} placeholder="Islamabad" error={errors.officeCity} onChange={(value) => updateForm('officeCity', value)} />
              <TextInput id="license" label={labelForJurisdiction(form.jurisdiction)} value={form.license} placeholder="License number" error={errors.license} onChange={(value) => updateForm('license', value)} />
              <TextInput id="ntn" label="NTN" value={form.ntn} placeholder="National Tax Number" error={errors.ntn} onChange={(value) => updateForm('ntn', value)} />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextInput id="cnic" label="CNIC" value={form.cnic} placeholder="1234567890123" error={errors.cnic} onChange={(value) => updateForm('cnic', value.replace(/\D/g, '').slice(0, 13))} />
            <TextInput id="capitalAvailablePkr" label="Capital Available (PKR)" value={form.capitalAvailablePkr} placeholder="400000" error={errors.capitalAvailablePkr} onChange={(value) => updateForm('capitalAvailablePkr', value.replace(/[^\d]/g, ''))} />
            <SelectInput id="jurisdiction" label="Jurisdiction" value={form.jurisdiction} options={JURISDICTIONS.map((item) => ({ value: item, label: item }))} error={errors.jurisdiction} onChange={(value) => updateForm('jurisdiction', value as Jurisdiction | '')} />
            <SelectInput id="legalEntityType" label="Legal Entity Type" value={form.legalEntityType} options={LEGAL_ENTITY_OPTIONS} error={errors.legalEntityType} onChange={(value) => updateForm('legalEntityType', value as LegalEntityType | '')} />
            {form.legalEntityType === 'COMPANY' && <TextInput id="secpRegistrationNumber" label="SECP Registration Number" value={form.secpRegistrationNumber} placeholder="SECP number" error={errors.secpRegistrationNumber} onChange={(value) => updateForm('secpRegistrationNumber', value)} />}
            {form.legalEntityType === 'PARTNERSHIP' && <TextInput id="partnershipRegistrationNumber" label="Partnership Registration Number" value={form.partnershipRegistrationNumber} placeholder="Partnership number" error={errors.partnershipRegistrationNumber} onChange={(value) => updateForm('partnershipRegistrationNumber', value)} />}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">Field of operations</label>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {FIELD_OF_OPERATIONS.map((item) => {
                const active = form.fieldOfOperations.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleFieldOperation(item)}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${
                      active ? 'border-[#0b8ccf] bg-[#e8f5fc] text-[#0b8ccf]' : 'border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            {errors.fieldOfOperations && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.fieldOfOperations}</p>}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FileUploadCard
              id="cnicImage"
              label="CNIC Image"
              file={files.cnicImage}
              helperText="Upload CNIC front image"
              error={errors.cnicImage}
              onDrop={handleDrop('cnicImage')}
              onFileChange={(file) => handleFileSelect('cnicImage', file)}
            />
          </div>

          <button type="submit" disabled={loading} className="h-12 w-full rounded-lg bg-[#0b8ccf] font-semibold text-white transition-colors hover:bg-[#097bb3] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Vehicle Account'}
          </button>

          <div className="pt-2 text-center text-sm text-slate-600">
            Already have an account? <Link to="/login" className="font-semibold text-[#0b8ccf]">Log in</Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
};

export default RegisterForm;
