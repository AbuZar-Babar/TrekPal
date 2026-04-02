export type ValidationErrors = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isBlank = (value?: string | null): boolean => !value || !value.trim();

export const validateRequired = (value: string, label: string): string | null => {
  if (isBlank(value)) {
    return `${label} is required`;
  }

  return null;
};

export const validateEmail = (value: string): string | null => {
  if (isBlank(value)) {
    return 'Email is required';
  }

  if (!emailPattern.test(value.trim())) {
    return 'Enter a valid email address';
  }

  return null;
};

export const validatePassword = (value: string): string | null => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }

  return null;
};

export const validatePhone = (value: string): string | null => {
  if (isBlank(value)) {
    return 'Phone number is required';
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length < 10) {
    return 'Enter a valid phone number';
  }

  return null;
};

export const validateCnic = (value: string): string | null => {
  if (isBlank(value)) {
    return 'CNIC is required';
  }

  if (!/^\d{13}$/.test(value)) {
    return 'CNIC must be exactly 13 digits';
  }

  return null;
};

export const validateMinLength = (
  value: string,
  label: string,
  minLength: number,
): string | null => {
  if (isBlank(value)) {
    return `${label} is required`;
  }

  if (value.trim().length < minLength) {
    return `${label} must be at least ${minLength} characters`;
  }

  return null;
};

export const validatePositiveNumber = (
  value: string | number,
  label: string,
  minValue = 1,
): string | null => {
  const parsedValue = typeof value === 'number' ? value : Number(value);

  if (Number.isNaN(parsedValue)) {
    return `${label} is required`;
  }

  if (parsedValue < minValue) {
    return `${label} must be at least ${minValue}`;
  }

  return null;
};

export const validateFilePresent = (file: File | null, label: string): string | null => {
  if (!file) {
    return `${label} is required`;
  }

  return null;
};

