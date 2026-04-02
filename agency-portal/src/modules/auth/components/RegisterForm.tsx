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

const STEPS = ['Account', 'Owner', 'Business', 'Docs'];
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
const DOCUMENT_MIME_TYPES = [...IMAGE_MIME_TYPES, 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type LegalEntityType = typeof LEGAL_ENTITY_OPTIONS[number]['value'];
type Jurisdiction = typeof JURISDICTIONS[number];
type FieldOfOperation = typeof FIELD_OF_OPERATIONS[number];
type ImageFileField = 'cnicImage' | 'ownerPhoto';
type DocumentFileField =
  | 'licenseCertificate'
  | 'ntnCertificate'
  | 'businessRegistrationProof'
  | 'officeProof'
  | 'bankCertificate'
  | 'additionalSupportingDocument';
type FileFieldKey = ImageFileField | DocumentFileField;

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
  ownerPhoto: File | null;
  licenseCertificate: File | null;
  ntnCertificate: File | null;
  businessRegistrationProof: File | null;
  officeProof: File | null;
  bankCertificate: File | null;
  additionalSupportingDocument: File | null;
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
  ownerPhoto: null,
  licenseCertificate: null,
  ntnCertificate: null,
  businessRegistrationProof: null,
  officeProof: null,
  bankCertificate: null,
  additionalSupportingDocument: null,
};

const labelForJurisdiction = (jurisdiction: Jurisdiction | '') =>
  jurisdiction ? `${jurisdiction} Tourism License Number` : 'Tourism License Number';

const fileLooksLikeImage = (file: File | null) => !!file && IMAGE_MIME_TYPES.includes(file.type);

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="mb-8 grid grid-cols-4 gap-3">
    {STEPS.map((label, index) => (
      <div
        key={label}
        className={`rounded-[18px] border px-3 py-3 text-center text-sm font-medium ${
          index === currentStep
            ? 'border-[var(--primary)] bg-[var(--panel)] text-[var(--primary)]'
            : index < currentStep
              ? 'border-[var(--success-bg)] bg-[var(--success-bg)] text-[var(--success-text)]'
              : 'border-[var(--border)] bg-[var(--panel-subtle)] text-[var(--text-soft)]'
        }`}
      >
        {label}
      </div>
    ))}
  </div>
);

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
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[var(--text)]">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="app-field"
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
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[var(--text)]">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="app-field"
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-2 text-sm text-[var(--danger-text)]">{error}</p>}
  </div>
);

const FileUploadCard = ({
  id,
  label,
  file,
  previewUrl,
  helperText,
  required = false,
  accept,
  error,
  onDrop,
  onFileChange,
}: {
  id: FileFieldKey;
  label: string;
  file: File | null;
  previewUrl?: string | null;
  helperText: string;
  required?: boolean;
  accept: string;
  error?: string;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
  onFileChange: (file: File) => void;
}) => (
  <div>
    <label
      htmlFor={id}
      onDrop={onDrop}
      onDragOver={(event) => event.preventDefault()}
      className="block cursor-pointer rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--panel-subtle)] p-5 transition-all duration-200 hover:border-[var(--primary)] hover:bg-[var(--panel)]"
    >
      <input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];
          if (selectedFile) {
            onFileChange(selectedFile);
          }
        }}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text)]">{label}</span>
            {required && (
              <span className="rounded-full bg-[var(--danger-bg)] px-2 py-1 text-[10px] text-[var(--danger-text)]">
                Required
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
          <p className="mt-2 truncate text-xs text-[var(--text-soft)]">
            {file ? file.name : 'Click or drop a file'}
          </p>
        </div>
        {previewUrl && fileLooksLikeImage(file) ? (
          <img
            src={previewUrl}
            alt={label}
            className="h-16 w-16 rounded-xl border border-[var(--border)] object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel)] text-xs font-semibold text-[var(--text-soft)]">
            {file?.type === 'application/pdf' ? 'PDF' : 'FILE'}
          </div>
        )}
      </div>
    </label>
    {error && <p className="mt-2 text-sm text-[var(--danger-text)]">{error}</p>}
  </div>
);

const RegisterForm = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [form, setForm] = useState<FormState>(initialFormState);
  const [files, setFiles] = useState<FileState>(initialFileState);
  const [previews, setPreviews] = useState<Record<ImageFileField, string | null>>({
    cnicImage: null,
    ownerPhoto: null,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isBusinessRegistrationRequired = useMemo(
    () => form.legalEntityType === 'COMPANY' || form.legalEntityType === 'PARTNERSHIP',
    [form.legalEntityType],
  );

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
    const allowedTypes = field === 'cnicImage' || field === 'ownerPhoto'
      ? IMAGE_MIME_TYPES
      : DOCUMENT_MIME_TYPES;

    if (!allowedTypes.includes(file.type)) {
      setFormError(
        field === 'cnicImage' || field === 'ownerPhoto'
          ? 'CNIC image and owner photo must be JPG, PNG, or WebP.'
          : 'Documents must be PDF, JPG, PNG, or WebP.',
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFormError('Each file must be 10MB or smaller.');
      return;
    }

    setFormError(null);
    setFiles((current) => ({ ...current, [field]: file }));

    if (field === 'cnicImage' || field === 'ownerPhoto') {
      setPreviews((current) => ({ ...current, [field]: URL.createObjectURL(file) }));
    }
  };

  const handleDrop = (field: FileFieldKey) => (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(field, file);
    }
  };

  const validateStep = (targetStep: number): ValidationErrors => {
    const nextErrors: ValidationErrors = {};

    if (targetStep === 0) {
      const nameError = validateMinLength(form.name, 'Agency name', 2);
      if (nameError) {
        nextErrors.name = nameError;
      }

      const emailError = validateEmail(form.email);
      if (emailError) {
        nextErrors.email = emailError;
      }

      const passwordError = validatePassword(form.password);
      if (passwordError) {
        nextErrors.password = passwordError;
      }
    }

    if (targetStep === 1) {
      const ownerNameError = validateMinLength(form.ownerName, 'Representative name', 2);
      if (ownerNameError) {
        nextErrors.ownerName = ownerNameError;
      }

      const phoneError = validatePhone(form.phone);
      if (phoneError) {
        nextErrors.phone = phoneError;
      }

      const cnicError = validateCnic(form.cnic);
      if (cnicError) {
        nextErrors.cnic = cnicError;
      }

      const cnicImageError = validateFilePresent(files.cnicImage, 'CNIC image');
      if (cnicImageError) {
        nextErrors.cnicImage = cnicImageError;
      }

      const ownerPhotoError = validateFilePresent(files.ownerPhoto, 'Owner photo');
      if (ownerPhotoError) {
        nextErrors.ownerPhoto = ownerPhotoError;
      }
    }

    if (targetStep === 2) {
      const addressError = validateMinLength(form.address, 'Office address', 5);
      if (addressError) {
        nextErrors.address = addressError;
      }

      const officeCityError = validateMinLength(form.officeCity, 'Office city', 2);
      if (officeCityError) {
        nextErrors.officeCity = officeCityError;
      }

      const jurisdictionError = validateRequired(form.jurisdiction, 'Jurisdiction');
      if (jurisdictionError) {
        nextErrors.jurisdiction = jurisdictionError;
      }

      const entityError = validateRequired(form.legalEntityType, 'Legal entity type');
      if (entityError) {
        nextErrors.legalEntityType = entityError;
      }

      const licenseError = validateRequired(form.license, 'Tourism license number');
      if (licenseError) {
        nextErrors.license = licenseError;
      }

      const ntnError = validateRequired(form.ntn, 'NTN');
      if (ntnError) {
        nextErrors.ntn = ntnError;
      }

      const capitalError = validatePositiveNumber(form.capitalAvailablePkr, 'Capital', 400000);
      if (capitalError) {
        nextErrors.capitalAvailablePkr = 'Capital must be at least 400000';
      }

      if (form.fieldOfOperations.length === 0) {
        nextErrors.fieldOfOperations = 'Select at least one field of operation';
      }

      if (form.legalEntityType === 'COMPANY' && !form.secpRegistrationNumber.trim()) {
        nextErrors.secpRegistrationNumber = 'SECP registration number is required';
      }

      if (form.legalEntityType === 'PARTNERSHIP' && !form.partnershipRegistrationNumber.trim()) {
        nextErrors.partnershipRegistrationNumber = 'Partnership registration number is required';
      }
    }

    if (targetStep === 3) {
      const licenseCertificateError = validateFilePresent(
        files.licenseCertificate,
        'Tourism license certificate',
      );
      if (licenseCertificateError) {
        nextErrors.licenseCertificate = licenseCertificateError;
      }

      const ntnCertificateError = validateFilePresent(files.ntnCertificate, 'NTN certificate');
      if (ntnCertificateError) {
        nextErrors.ntnCertificate = ntnCertificateError;
      }

      const officeProofError = validateFilePresent(files.officeProof, 'Office proof');
      if (officeProofError) {
        nextErrors.officeProof = officeProofError;
      }

      const bankCertificateError = validateFilePresent(files.bankCertificate, 'Bank certificate');
      if (bankCertificateError) {
        nextErrors.bankCertificate = bankCertificateError;
      }

      if (isBusinessRegistrationRequired) {
        const businessProofError = validateFilePresent(
          files.businessRegistrationProof,
          'Business registration proof',
        );
        if (businessProofError) {
          nextErrors.businessRegistrationProof = businessProofError;
        }
      }
    }

    return nextErrors;
  };

  const goToNextStep = () => {
    const nextErrors = validateStep(step);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }
  };

  const goToPreviousStep = () => {
    setFormError(null);
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    for (let index = 0; index < STEPS.length; index += 1) {
      const stepErrors = validateStep(index);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setStep(index);
        return;
      }
    }

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
          ownerPhoto: files.ownerPhoto!,
          licenseCertificate: files.licenseCertificate!,
          ntnCertificate: files.ntnCertificate!,
          officeProof: files.officeProof!,
          bankCertificate: files.bankCertificate!,
          businessRegistrationProof: files.businessRegistrationProof || undefined,
          additionalSupportingDocument: files.additionalSupportingDocument || undefined,
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
      badge="Agency sign up"
      title="Register agency"
      subtitle="Add your business details and documents for review."
      panelTitle="Register once. Start after approval."
      panelText="Submit the agency details, representative identity, and core documents. Admin approval unlocks login."
      panelPoints={[
        'Business and representative details.',
        'Required KYC and registration documents.',
        'Pending review before portal access.',
      ]}
    >
      <div className="app-card px-6 py-6 md:px-8 md:py-8">
        <StepIndicator currentStep={step} />

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {formError && (
            <div className="rounded-[20px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
              {formError}
            </div>
          )}

          {step === 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <TextInput
                  id="name"
                  label="Agency name"
                  value={form.name}
                  placeholder="Example Travels"
                  error={errors.name}
                  onChange={(value) => updateForm('name', value)}
                />
              </div>

              <TextInput
                id="email"
                label="Business email"
                type="email"
                value={form.email}
                placeholder="agency@example.com"
                error={errors.email}
                onChange={(value) => updateForm('email', value)}
              />

              <div>
                <TextInput
                  id="password"
                  label="Password"
                  type="password"
                  value={form.password}
                  placeholder="Create password"
                  error={errors.password}
                  onChange={(value) => updateForm('password', value)}
                />
                <PasswordStrengthIndicator password={form.password} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <TextInput
                  id="ownerName"
                  label="Representative name"
                  value={form.ownerName}
                  placeholder="Full name"
                  error={errors.ownerName}
                  onChange={(value) => updateForm('ownerName', value)}
                />

                <TextInput
                  id="phone"
                  label="Phone"
                  value={form.phone}
                  placeholder="+92 300 1234567"
                  error={errors.phone}
                  onChange={(value) => updateForm('phone', value)}
                />
              </div>

              <div className="max-w-sm">
                <TextInput
                  id="cnic"
                  label="CNIC"
                  value={form.cnic}
                  placeholder="1234567890123"
                  error={errors.cnic}
                  onChange={(value) => updateForm('cnic', value.replace(/\D/g, '').slice(0, 13))}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FileUploadCard
                  id="cnicImage"
                  label="CNIC image"
                  file={files.cnicImage}
                  previewUrl={previews.cnicImage}
                  helperText="JPG, PNG, or WebP"
                  required
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  error={errors.cnicImage}
                  onDrop={handleDrop('cnicImage')}
                  onFileChange={(file) => handleFileSelect('cnicImage', file)}
                />

                <FileUploadCard
                  id="ownerPhoto"
                  label="Owner photo"
                  file={files.ownerPhoto}
                  previewUrl={previews.ownerPhoto}
                  helperText="JPG, PNG, or WebP"
                  required
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  error={errors.ownerPhoto}
                  onDrop={handleDrop('ownerPhoto')}
                  onFileChange={(file) => handleFileSelect('ownerPhoto', file)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <TextInput
                    id="address"
                    label="Office address"
                    value={form.address}
                    placeholder="Full office address"
                    error={errors.address}
                    onChange={(value) => updateForm('address', value)}
                  />
                </div>

                <TextInput
                  id="officeCity"
                  label="Office city"
                  value={form.officeCity}
                  placeholder="Islamabad"
                  error={errors.officeCity}
                  onChange={(value) => updateForm('officeCity', value)}
                />

                <SelectInput
                  id="jurisdiction"
                  label="Jurisdiction"
                  value={form.jurisdiction}
                  options={JURISDICTIONS.map((item) => ({ value: item, label: item }))}
                  error={errors.jurisdiction}
                  onChange={(value) => updateForm('jurisdiction', value as Jurisdiction | '')}
                />

                <SelectInput
                  id="legalEntityType"
                  label="Legal entity type"
                  value={form.legalEntityType}
                  options={LEGAL_ENTITY_OPTIONS}
                  error={errors.legalEntityType}
                  onChange={(value) => updateForm('legalEntityType', value as LegalEntityType | '')}
                />

                <TextInput
                  id="license"
                  label={labelForJurisdiction(form.jurisdiction)}
                  value={form.license}
                  placeholder="Regulator-issued number"
                  error={errors.license}
                  onChange={(value) => updateForm('license', value)}
                />

                <TextInput
                  id="ntn"
                  label="NTN"
                  value={form.ntn}
                  placeholder="National Tax Number"
                  error={errors.ntn}
                  onChange={(value) => updateForm('ntn', value)}
                />

                {form.legalEntityType === 'COMPANY' && (
                  <TextInput
                    id="secpRegistrationNumber"
                    label="SECP registration number"
                    value={form.secpRegistrationNumber}
                    placeholder="SECP number"
                    error={errors.secpRegistrationNumber}
                    onChange={(value) => updateForm('secpRegistrationNumber', value)}
                  />
                )}

                {form.legalEntityType === 'PARTNERSHIP' && (
                  <TextInput
                    id="partnershipRegistrationNumber"
                    label="Partnership registration number"
                    value={form.partnershipRegistrationNumber}
                    placeholder="Partnership number"
                    error={errors.partnershipRegistrationNumber}
                    onChange={(value) => updateForm('partnershipRegistrationNumber', value)}
                  />
                )}

                <TextInput
                  id="capitalAvailablePkr"
                  label="Capital available (PKR)"
                  value={form.capitalAvailablePkr}
                  placeholder="400000"
                  error={errors.capitalAvailablePkr}
                  onChange={(value) => updateForm('capitalAvailablePkr', value.replace(/[^\d]/g, ''))}
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="block text-sm font-semibold text-[var(--text)]">
                    Field of operations
                  </label>
                  <span className="text-xs text-[var(--text-soft)]">
                    {form.fieldOfOperations.length} selected
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {FIELD_OF_OPERATIONS.map((item) => {
                    const active = form.fieldOfOperations.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleFieldOperation(item)}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'border-[var(--primary)] bg-[var(--panel)] text-[var(--primary)] shadow-sm'
                            : 'border-[var(--border)] bg-[var(--panel-subtle)] text-[var(--text-muted)] hover:border-[var(--primary)]'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                {errors.fieldOfOperations && (
                  <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.fieldOfOperations}</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-5 md:grid-cols-2">
              <FileUploadCard
                id="licenseCertificate"
                label="Tourism license certificate"
                file={files.licenseCertificate}
                helperText="PDF, JPG, PNG, or WebP"
                required
                accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                error={errors.licenseCertificate}
                onDrop={handleDrop('licenseCertificate')}
                onFileChange={(file) => handleFileSelect('licenseCertificate', file)}
              />

              <FileUploadCard
                id="ntnCertificate"
                label="NTN certificate"
                file={files.ntnCertificate}
                helperText="PDF, JPG, PNG, or WebP"
                required
                accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                error={errors.ntnCertificate}
                onDrop={handleDrop('ntnCertificate')}
                onFileChange={(file) => handleFileSelect('ntnCertificate', file)}
              />

              <FileUploadCard
                id="officeProof"
                label="Office proof"
                file={files.officeProof}
                helperText="Ownership or rent proof"
                required
                accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                error={errors.officeProof}
                onDrop={handleDrop('officeProof')}
                onFileChange={(file) => handleFileSelect('officeProof', file)}
              />

              <FileUploadCard
                id="bankCertificate"
                label="Bank certificate"
                file={files.bankCertificate}
                helperText="Business bank proof"
                required
                accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                error={errors.bankCertificate}
                onDrop={handleDrop('bankCertificate')}
                onFileChange={(file) => handleFileSelect('bankCertificate', file)}
              />

              <FileUploadCard
                id="businessRegistrationProof"
                label="Business registration proof"
                file={files.businessRegistrationProof}
                helperText={isBusinessRegistrationRequired ? 'Required for company and partnership' : 'Optional'}
                required={isBusinessRegistrationRequired}
                accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                error={errors.businessRegistrationProof}
                onDrop={handleDrop('businessRegistrationProof')}
                onFileChange={(file) => handleFileSelect('businessRegistrationProof', file)}
              />

              <FileUploadCard
                id="additionalSupportingDocument"
                label="Additional document"
                file={files.additionalSupportingDocument}
                helperText="Optional extra proof"
                accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                onDrop={handleDrop('additionalSupportingDocument')}
                onFileChange={(file) => handleFileSelect('additionalSupportingDocument', file)}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={goToPreviousStep}
                className="app-btn-secondary h-11 px-5 text-sm"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="app-btn-primary h-11 px-6 text-sm"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="app-btn-primary h-11 px-6 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit for review'}
              </button>
            )}
          </div>

          <div className="border-t border-[var(--border)] pt-6 text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--primary)]">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
};

export default RegisterForm;
