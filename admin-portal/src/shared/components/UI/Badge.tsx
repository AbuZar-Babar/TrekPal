import { ReactNode } from 'react';

type Variant = 'neutral' | 'success' | 'warning' | 'danger' | 'outline';

interface BadgeProps {
  variant?: Variant;
  dot?: boolean;
  children: ReactNode;
}

const Badge = ({ variant = 'neutral', dot = false, children }: BadgeProps) => {
  return (
    <span className={`ap-badge ap-badge-${variant} ${dot ? 'ap-badge-dot' : ''}`.trim()}>
      {children}
    </span>
  );
};

export const statusToVariant = (status: string): Variant => {
  const s = status.toUpperCase();
  if (s === 'APPROVED' || s === 'VERIFIED' || s === 'ACTIVE') return 'success';
  if (s === 'PENDING' || s === 'NOT_SUBMITTED') return 'warning';
  if (s === 'REJECTED' || s === 'BLOCKED' || s === 'DISABLED') return 'danger';
  return 'neutral';
};

export default Badge;
