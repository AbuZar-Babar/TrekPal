export const formatCurrency = (value: number | null | undefined, fallback = 'Flexible') => {
  if (value === null || value === undefined) {
    return fallback;
  }

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCompactNumber = (value: number | null | undefined) => {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);
};

export const formatDate = (
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!value) {
    return '--';
  }

  const parsedDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat('en-PK', options || {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
};

export const formatDateTime = (value: string | Date | null | undefined) => {
  return formatDate(value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatDateRange = (
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const formatStatusLabel = (value: string | null | undefined) => {
  if (!value) {
    return '--';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

export const formatShortId = (value: string | null | undefined) => {
  if (!value) {
    return '--';
  }

  return value.slice(0, 8).toUpperCase();
};
