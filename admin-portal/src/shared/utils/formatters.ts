const currencyFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

export const formatCurrency = (value: number | null | undefined) => {
  if (typeof value !== 'number') {
    return 'Not available';
  }

  return currencyFormatter.format(value);
};

export const formatDate = (
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
) => {
  if (!value) {
    return 'Not available';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleDateString(
    'en-US',
    options ?? { month: 'short', day: 'numeric', year: 'numeric' }
  );
};

export const formatDateTime = (value: string | Date | null | undefined) => {
  if (!value) {
    return 'Not available';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const toTitleCase = (value: string | null | undefined) => {
  if (!value) {
    return 'Not provided';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const maskCnic = (value: string | null | undefined) => {
  if (!value) {
    return 'Not provided';
  }

  const lastFour = value.slice(-4);
  return `*****-${lastFour}`;
};

export const getInitials = (value: string | null | undefined, fallback = 'TP') => {
  if (!value) {
    return fallback;
  }

  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return fallback;
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

export const formatTravelerKycStatus = (
  value: string | null | undefined,
  cnicVerified?: boolean
) => {
  if (value === 'VERIFIED' || cnicVerified) {
    return 'Verified';
  }

  if (value === 'NOT_SUBMITTED') {
    return 'Not Submitted';
  }

  return toTitleCase(value ?? 'Not submitted');
};

export const getTravelerKycTone = (value: string | null | undefined, cnicVerified?: boolean) => {
  if (value === 'VERIFIED' || cnicVerified) {
    return 'success';
  }

  if (value === 'PENDING') {
    return 'warning';
  }

  if (value === 'REJECTED') {
    return 'danger';
  }

  return 'neutral';
};
