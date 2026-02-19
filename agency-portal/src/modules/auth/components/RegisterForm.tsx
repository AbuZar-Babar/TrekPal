import { useState, useRef, DragEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../store/authSlice';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import ErrorPopup from '../../../shared/components/ErrorPopup';

const STEPS = ['Agency Info', 'Owner KYC', 'Documents'];

/**
 * Agency Registration Form - Multi-Step Wizard with KYC
 */
const RegisterForm = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Step 1: Agency Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Owner KYC
  const [ownerName, setOwnerName] = useState('');
  const [cnic, setCnic] = useState('');

  // Step 3: Documents
  const [cnicImage, setCnicImage] = useState<File | null>(null);
  const [ownerPhoto, setOwnerPhoto] = useState<File | null>(null);
  const [cnicPreview, setCnicPreview] = useState<string | null>(null);
  const [ownerPhotoPreview, setOwnerPhotoPreview] = useState<string | null>(null);

  const cnicInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Validation per step
  const validateStep = (): boolean => {
    setError(null);
    if (step === 0) {
      if (!name.trim()) { setError('Agency name is required'); return false; }
      if (!email.trim()) { setError('Email is required'); return false; }
      if (password.length < 8) { setError('Password must be at least 8 characters'); return false; }
    }
    if (step === 1) {
      if (!ownerName.trim()) { setError('Owner name is required'); return false; }
      if (!cnic.trim() || cnic.length !== 13) { setError('CNIC must be exactly 13 digits'); return false; }
      if (!/^\d{13}$/.test(cnic)) { setError('CNIC must contain only digits'); return false; }
    }
    if (step === 2) {
      if (!cnicImage) { setError('CNIC image is required'); return false; }
      if (!ownerPhoto) { setError('Owner photo is required'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleFileSelect = (type: 'cnic' | 'photo', file: File) => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be under 5MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    setError(null);
    const previewUrl = URL.createObjectURL(file);
    if (type === 'cnic') {
      setCnicImage(file);
      setCnicPreview(previewUrl);
    } else {
      setOwnerPhoto(file);
      setOwnerPhotoPreview(previewUrl);
    }
  };

  const handleDrop = (type: 'cnic' | 'photo') => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(type, file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setError(null);
    setLoading(true);

    try {
      const resultAction = await dispatch(
        signup({
          email,
          password,
          name,
          ownerName,
          cnic,
          cnicImage: cnicImage!,
          ownerPhoto: ownerPhoto!,
        }) as any
      );

      if (resultAction?.error) {
        setError(resultAction.error.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      navigate('/pending-approval', { state: { email, name } });
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Progress bar
  const ProgressBar = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${i < step
                ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-100'
                : i === step
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 scale-110'
                  : 'bg-gray-200 text-gray-400'
                }`}
            >
              {i < step ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-xs mt-1.5 font-medium transition-colors duration-300 ${i <= step ? 'text-gray-700' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-1 mx-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: i < step ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const FileDropZone = ({
    label,
    type,
    preview,
    inputRef,
  }: {
    label: string;
    type: 'cnic' | 'photo';
    preview: string | null;
    inputRef: any;
  }) => (
    <div
      className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 group active:scale-[0.98]"
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop(type)}
      onDragOver={handleDragOver}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(type, file);
        }}
      />
      {preview ? (
        <div className="relative animate-scaleIn">
          <img
            src={preview}
            alt={label}
            className="max-h-40 mx-auto rounded-xl object-cover shadow-lg"
          />
          <div className="mt-3 text-sm text-green-600 font-medium flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Uploaded — click to change
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3 group-hover:bg-indigo-100 transition-colors duration-300">
            <svg className="w-7 h-7 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Drag & drop or click to upload</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[11px] text-gray-300">JPEG, PNG or WebP — Max 5MB</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}

      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-lg w-full relative z-10 px-4 animate-slideUp">
        {/* Logo/Header */}
        <div className="text-center mb-6 text-white animate-fadeDown">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-4 shadow-xl border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-1 drop-shadow-lg">Create Agency Account</h2>
          <p className="text-gray-200 text-sm drop-shadow-md">Complete KYC verification to get started</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-scaleIn">
          <ProgressBar />

          <form onSubmit={handleSubmit}>
            {/* Step 1: Agency Info */}
            {step === 0 && (
              <div className="space-y-5 animate-stepIn" key="step-0">
                <div className="animate-fadeIn" style={{ animationDelay: '0.05s' }}>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Agency Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                      placeholder="Travel Agency Inc" />
                  </div>
                </div>
                <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                      placeholder="agency@example.com" />
                  </div>
                </div>
                <div className="animate-fadeIn" style={{ animationDelay: '0.15s' }}>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                      placeholder="Create a password" />
                  </div>
                  <PasswordStrengthIndicator password={password} />
                </div>
              </div>
            )}

            {/* Step 2: Owner KYC */}
            {step === 1 && (
              <div className="space-y-5 animate-stepIn" key="step-1">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-xs text-blue-700">
                      KYC verification is required. Your identity will be reviewed by our admin team.
                    </p>
                  </div>
                </div>
                <div className="animate-fadeIn" style={{ animationDelay: '0.05s' }}>
                  <label htmlFor="ownerName" className="block text-sm font-semibold text-gray-700 mb-2">Owner Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input id="ownerName" type="text" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                      placeholder="Full name as per CNIC" />
                  </div>
                </div>
                <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                  <label htmlFor="cnic" className="block text-sm font-semibold text-gray-700 mb-2">CNIC Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <input id="cnic" type="text" required maxLength={13} value={cnic}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setCnic(value);
                      }}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 font-mono tracking-wider"
                      placeholder="1234567890123" />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[11px] text-gray-300">13-digit national identity number</p>
                    </div>
                    <p className={`text-xs font-medium transition-colors ${cnic.length === 13 ? 'text-green-500' : 'text-gray-400'}`}>
                      {cnic.length}/13
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {step === 2 && (
              <div className="space-y-5 animate-stepIn" key="step-2">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-xs text-amber-700">
                      Upload clear, readable images. Blurry or invalid documents will be rejected.
                    </p>
                  </div>
                </div>
                <div className="animate-fadeIn" style={{ animationDelay: '0.05s' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CNIC Card Image</label>
                  <FileDropZone label="Upload CNIC Card Photo" type="cnic" preview={cnicPreview} inputRef={cnicInputRef} />
                </div>
                <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Photo</label>
                  <FileDropZone label="Upload Your Photo" type="photo" preview={ownerPhotoPreview} inputRef={photoInputRef} />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 gap-3">
              {step > 0 ? (
                <button type="button" onClick={prevStep}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-[0.97]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={nextStep}
                  className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.97]">
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Registration
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Sign In Link */}
            <div className="text-center pt-6 mt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Shared Animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideUp { animation: slideUp 0.6s ease-out; }
        .animate-fadeDown { animation: fadeDown 0.5s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out both; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out both; }
        .animate-stepIn { animation: stepIn 0.35s ease-out; }
      `}</style>
    </div>
  );
};

export default RegisterForm;
