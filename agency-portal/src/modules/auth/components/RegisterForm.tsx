import { DragEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../store/authSlice';
import AuthShell from './AuthShell';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import ErrorPopup from '../../../shared/components/ErrorPopup';

const STEPS = ['Account', 'Representative', 'Business', 'Documents', 'Review'];
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

const formatCurrency = (value: string) => {
  const amount = Number(value || 0);
  if (Number.isNaN(amount) || amount <= 0) {
    return 'PKR 0';
  }

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const fileLooksLikeImage = (file: File | null) => !!file && IMAGE_MIME_TYPES.includes(file.type);

const RegisterForm = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [files, setFiles] = useState<FileState>(initialFileState);
  const [previews, setPreviews] = useState<Record<ImageFileField, string | null>>({
    cnicImage: null,
    ownerPhoto: null,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isBusinessRegistrationRequired =
    form.legalEntityType === 'COMPANY' || form.legalEntityType === 'PARTNERSHIP';

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
      setError(
        field === 'cnicImage' || field === 'ownerPhoto'
          ? 'CNIC image and owner photo must be JPEG, PNG, or WebP'
          : 'Documents must be PDF, JPEG, PNG, or WebP'
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Each uploaded file must be 10MB or smaller');
      return;
    }

    setError(null);
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

  const getStepError = (targetStep: number): string | null => {
    if (targetStep === 0) {
      if (!form.name.trim()) return 'Agency name is required';
      if (!form.email.trim()) return 'Email is required';
      if (form.password.length < 8) return 'Password must be at least 8 characters';
    }

    if (targetStep === 1) {
      if (!form.ownerName.trim()) return 'Representative name is required';
      if (!form.phone.trim()) return 'Phone number is required';
      if (!/^\d{13}$/.test(form.cnic)) return 'CNIC must be exactly 13 digits';
      if (!files.cnicImage) return 'CNIC image is required';
      if (!files.ownerPhoto) return 'Owner photo is required';
    }

    if (targetStep === 2) {
      if (!form.address.trim()) return 'Office address is required';
      if (!form.officeCity.trim()) return 'Office city is required';
      if (!form.jurisdiction) return 'Jurisdiction is required';
      if (!form.legalEntityType) return 'Legal entity type is required';
      if (!form.license.trim()) return 'Tourism license number is required';
      if (!form.ntn.trim()) return 'NTN is required';
      if (form.fieldOfOperations.length === 0) return 'Select at least one field of operation';

      const capital = Number(form.capitalAvailablePkr);
      if (!form.capitalAvailablePkr.trim() || Number.isNaN(capital)) {
        return 'Capital available in PKR is required';
      }
      if (capital < 400000) return 'Capital available must be at least PKR 400,000';

      if (form.legalEntityType === 'COMPANY' && !form.secpRegistrationNumber.trim()) {
        return 'SECP registration number is required for companies';
      }
      if (form.legalEntityType === 'PARTNERSHIP' && !form.partnershipRegistrationNumber.trim()) {
        return 'Partnership registration number is required for partnerships';
      }
    }

    if (targetStep === 3) {
      if (!files.licenseCertificate) return 'Tourism license certificate is required';
      if (!files.ntnCertificate) return 'NTN certificate is required';
      if (!files.officeProof) return 'Office ownership or rent proof is required';
      if (!files.bankCertificate) return 'Bank certificate is required';
      if (isBusinessRegistrationRequired && !files.businessRegistrationProof) {
        return 'Business registration proof is required for companies and partnerships';
      }
    }

    return null;
  };

  const validateCurrentStep = () => {
    const validationError = getStepError(step);
    setError(validationError);
    return !validationError;
  };

  const goToNextStep = () => {
    if (validateCurrentStep()) {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }
  };

  const goToPreviousStep = () => {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    for (let index = 0; index < STEPS.length - 1; index += 1) {
      const validationError = getStepError(index);
      if (validationError) {
        setError(validationError);
        setStep(index);
        return;
      }
    }

    setError(null);
    setLoading(true);

    try {
      const resultAction = await dispatch(
        signup({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone,
          address: form.address,
          officeCity: form.officeCity,
          jurisdiction: form.jurisdiction as Jurisdiction,
          legalEntityType: form.legalEntityType as LegalEntityType,
          license: form.license,
          ntn: form.ntn,
          ownerName: form.ownerName,
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
          secpRegistrationNumber: form.secpRegistrationNumber || undefined,
          partnershipRegistrationNumber: form.partnershipRegistrationNumber || undefined,
        }) as any
      );

      if (resultAction?.error) {
        setError(resultAction.error.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      navigate('/pending-approval', { state: { email: form.email, name: form.name } });
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const ProgressBar = () => (
    <div className="mb-8 flex items-center justify-between gap-2">
      {STEPS.map((label, index) => (
        <div key={label} className="flex flex-1 items-center">
          <div className="flex min-w-0 flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                index < step
                  ? 'bg-[var(--success-text)] text-white'
                  : index === step
                    ? 'scale-105 bg-[var(--primary)] text-white shadow-lg'
                    : 'bg-[var(--panel-strong)] text-[var(--text-soft)]'
              }`}
            >
              {index < step ? 'OK' : index + 1}
            </div>
            <span className={`mt-2 text-[11px] font-medium ${index <= step ? 'text-[var(--text)]' : 'text-[var(--text-soft)]'}`}>
              {label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div className="mx-2 h-1 flex-1 overflow-hidden rounded-full bg-[var(--panel-strong)]">
              <div className="h-full bg-[var(--success-text)] transition-all duration-300" style={{ width: index < step ? '100%' : '0%' }} />
            </div>
          )}
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
    onChange,
  }: {
    id: string;
    label: string;
    value: string;
    placeholder: string;
    type?: string;
    onChange: (value: string) => void;
  }) => (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[var(--text)]">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="app-field"
        placeholder={placeholder}
      />
    </div>
  );

  const SelectInput = ({
    id,
    label,
    value,
    options,
    onChange,
  }: {
    id: string;
    label: string;
    value: string;
    options: readonly { value: string; label: string }[];
    onChange: (value: string) => void;
  }) => (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[var(--text)]">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="app-field"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
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
    onFileChange,
  }: {
    id: FileFieldKey;
    label: string;
    file: File | null;
    previewUrl?: string | null;
    helperText: string;
    required?: boolean;
    accept: string;
    onFileChange: (file: File) => void;
  }) => (
    <label
      htmlFor={id}
      onDrop={handleDrop(id)}
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
            {required && <span className="rounded-full bg-[var(--danger-bg)] px-2 py-1 text-[10px] text-[var(--danger-text)]">Required</span>}
          </div>
          <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
          <p className="mt-2 truncate text-xs text-[var(--text-soft)]">{file ? file.name : 'Drag and drop or click to upload'}</p>
        </div>
        {previewUrl && fileLooksLikeImage(file) ? (
          <img src={previewUrl} alt={label} className="h-16 w-16 rounded-xl border border-[var(--border)] object-cover shadow-sm" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel)] text-xs font-semibold text-[var(--text-soft)]">
            {file?.type === 'application/pdf' ? 'PDF' : 'FILE'}
          </div>
        )}
      </div>
    </label>
  );

  const ReviewRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-right font-medium text-[var(--text)]">{value}</span>
    </div>
  );

  return (
    <AuthShell
      badge="Agency registration"
      title="Register your travel business for marketplace access"
      subtitle="Complete the business application with representative details, operational scope, and verification documents."
      panelTitle="Built for agencies that need operational clarity."
      panelText="The registration flow captures enough structure for approval without turning the application into paperwork chaos. Once approved, the same portal opens into quoting, bookings, hotels, and vehicles."
      panelPoints={[
        'Submit verified business and representative details.',
        'Upload regulator, identity, and banking support documents.',
        'Move into the marketplace after admin approval.',
      ]}
    >
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
      <div className="app-card px-6 py-6 md:px-8 md:py-8">
          <ProgressBar />
          <form onSubmit={handleSubmit}>
            {step === 0 && (
              <div className="grid md:grid-cols-2 gap-5 animate-stepIn">
                <div className="md:col-span-2">
                  <TextInput id="name" label="Agency Name" value={form.name} placeholder="Example Travels" onChange={(value) => updateForm('name', value)} />
                </div>
                <TextInput id="email" label="Business Email" type="email" value={form.email} placeholder="agency@example.com" onChange={(value) => updateForm('email', value)} />
                <div>
                  <TextInput id="password" label="Password" type="password" value={form.password} placeholder="Create a password" onChange={(value) => updateForm('password', value)} />
                  <PasswordStrengthIndicator password={form.password} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-stepIn">
                <div className="grid md:grid-cols-2 gap-5">
                  <TextInput id="ownerName" label="Owner / Authorized Representative" value={form.ownerName} placeholder="Full name as per CNIC" onChange={(value) => updateForm('ownerName', value)} />
                  <TextInput id="phone" label="Phone Number" value={form.phone} placeholder="+92 300 1234567" onChange={(value) => updateForm('phone', value)} />
                </div>
                <div className="max-w-sm">
                  <TextInput id="cnic" label="CNIC Number" value={form.cnic} placeholder="1234567890123" onChange={(value) => updateForm('cnic', value.replace(/\D/g, '').slice(0, 13))} />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <FileUploadCard id="cnicImage" label="CNIC Image" file={files.cnicImage} previewUrl={previews.cnicImage} helperText="Upload a clear photo of the representative CNIC" required accept="image/jpeg,image/png,image/jpg,image/webp" onFileChange={(file) => handleFileSelect('cnicImage', file)} />
                  <FileUploadCard id="ownerPhoto" label="Owner Photo" file={files.ownerPhoto} previewUrl={previews.ownerPhoto} helperText="Upload a recent photo of the representative" required accept="image/jpeg,image/png,image/jpg,image/webp" onFileChange={(file) => handleFileSelect('ownerPhoto', file)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-stepIn">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <TextInput id="address" label="Office Address" value={form.address} placeholder="Full office address" onChange={(value) => updateForm('address', value)} />
                  </div>
                  <TextInput id="officeCity" label="Office City" value={form.officeCity} placeholder="Islamabad" onChange={(value) => updateForm('officeCity', value)} />
                  <SelectInput id="jurisdiction" label="Jurisdiction" value={form.jurisdiction} options={JURISDICTIONS.map((item) => ({ value: item, label: item }))} onChange={(value) => updateForm('jurisdiction', value as Jurisdiction | '')} />
                  <SelectInput id="legalEntityType" label="Legal Entity Type" value={form.legalEntityType} options={LEGAL_ENTITY_OPTIONS} onChange={(value) => updateForm('legalEntityType', value as LegalEntityType | '')} />
                  <TextInput id="license" label={labelForJurisdiction(form.jurisdiction)} value={form.license} placeholder="Enter regulator-issued license number" onChange={(value) => updateForm('license', value)} />
                  <TextInput id="ntn" label="NTN" value={form.ntn} placeholder="National Tax Number" onChange={(value) => updateForm('ntn', value)} />
                  {form.legalEntityType === 'COMPANY' && (
                    <TextInput id="secpRegistrationNumber" label="SECP Registration Number" value={form.secpRegistrationNumber} placeholder="Enter SECP registration number" onChange={(value) => updateForm('secpRegistrationNumber', value)} />
                  )}
                  {form.legalEntityType === 'PARTNERSHIP' && (
                    <TextInput id="partnershipRegistrationNumber" label="Partnership Registration Number" value={form.partnershipRegistrationNumber} placeholder="Enter partnership registration number" onChange={(value) => updateForm('partnershipRegistrationNumber', value)} />
                  )}
                  <TextInput id="capitalAvailablePkr" label="Capital Available (PKR)" value={form.capitalAvailablePkr} placeholder="400000" onChange={(value) => updateForm('capitalAvailablePkr', value.replace(/[^\d]/g, ''))} />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <label className="block text-sm font-semibold text-gray-700">Field of Operations</label>
                    <span className="text-xs text-gray-500">{form.fieldOfOperations.length} selected</span>
                  </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                </div>
                <div className="rounded-xl border border-[var(--warning-bg)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning-text)]">
                  Minimum capital for this simplified application is set to PKR 400,000 for demo and review purposes.
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-stepIn">
                <div className="grid md:grid-cols-2 gap-5">
                  <FileUploadCard id="licenseCertificate" label="Tourism License Certificate" file={files.licenseCertificate} helperText="Upload the regulator-issued tourism license certificate" required accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" onFileChange={(file) => handleFileSelect('licenseCertificate', file)} />
                  <FileUploadCard id="ntnCertificate" label="NTN Certificate" file={files.ntnCertificate} helperText="Upload the FBR NTN certificate" required accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" onFileChange={(file) => handleFileSelect('ntnCertificate', file)} />
                  <FileUploadCard id="officeProof" label="Office Ownership / Rent Proof" file={files.officeProof} helperText="Rent agreement, office ownership proof, or similar document" required accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" onFileChange={(file) => handleFileSelect('officeProof', file)} />
                  <FileUploadCard id="bankCertificate" label="Bank Certificate" file={files.bankCertificate} helperText="Upload a bank certificate or equivalent business banking proof" required accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" onFileChange={(file) => handleFileSelect('bankCertificate', file)} />
                  <FileUploadCard id="businessRegistrationProof" label="Business Registration Proof" file={files.businessRegistrationProof} helperText={isBusinessRegistrationRequired ? 'Required for company and partnership registrations' : 'Optional for sole proprietors'} required={isBusinessRegistrationRequired} accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" onFileChange={(file) => handleFileSelect('businessRegistrationProof', file)} />
                  <FileUploadCard id="additionalSupportingDocument" label="Additional Supporting Document" file={files.additionalSupportingDocument} helperText="Optional extra document for any supporting material" accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" onFileChange={(file) => handleFileSelect('additionalSupportingDocument', file)} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-stepIn">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-subtle)] p-5">
                    <h3 className="mb-3 text-base font-semibold text-[var(--text)]">Agency Summary</h3>
                    <ReviewRow label="Agency Name" value={form.name} />
                    <ReviewRow label="Business Email" value={form.email} />
                    <ReviewRow label="Phone" value={form.phone} />
                    <ReviewRow label="Office City" value={form.officeCity} />
                    <ReviewRow label="Jurisdiction" value={form.jurisdiction || '-'} />
                    <ReviewRow label="Legal Entity" value={LEGAL_ENTITY_OPTIONS.find((option) => option.value === form.legalEntityType)?.label || '-'} />
                    <ReviewRow label="Tourism License Number" value={form.license} />
                    <ReviewRow label="NTN" value={form.ntn} />
                    <ReviewRow label="Capital" value={formatCurrency(form.capitalAvailablePkr)} />
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-subtle)] p-5">
                    <h3 className="mb-3 text-base font-semibold text-[var(--text)]">Representative & Scope</h3>
                    <ReviewRow label="Representative" value={form.ownerName} />
                    <ReviewRow label="CNIC" value={form.cnic} />
                    <ReviewRow label="Field of Operations" value={form.fieldOfOperations.length > 0 ? form.fieldOfOperations.join(', ') : '-'} />
                    {form.secpRegistrationNumber && <ReviewRow label="SECP Registration" value={form.secpRegistrationNumber} />}
                    {form.partnershipRegistrationNumber && <ReviewRow label="Partnership Registration" value={form.partnershipRegistrationNumber} />}
                    <ReviewRow label="Documents Ready" value={[files.cnicImage, files.ownerPhoto, files.licenseCertificate, files.ntnCertificate, files.officeProof, files.bankCertificate, files.businessRegistrationProof, files.additionalSupportingDocument].filter(Boolean).length.toString()} />
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-subtle)] p-4 text-sm text-[var(--text-muted)]">
                  Your agency account will stay in <strong>PENDING</strong> status until an admin reviews the application and documents.
                </div>
              </div>
            )}
            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button type="button" onClick={goToPreviousStep} className="app-btn-secondary h-11 px-5 text-sm">
                  Back
                </button>
              ) : (
                <div />
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={goToNextStep} className="app-btn-primary h-11 px-6 text-sm">
                  Next
                </button>
              ) : (
                <button type="submit" disabled={loading} className="app-btn-primary h-11 px-6 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
            <div className="mt-4 border-t border-[var(--border)] pt-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Already have an account? <Link to="/login" className="font-semibold text-[var(--primary)]">Sign in</Link>
              </p>
            </div>
          </form>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
        .animate-stepIn { animation: stepIn 0.3s ease-out; }
      `}</style>
    </AuthShell>
  );
};

export default RegisterForm;
