import { ReactNode } from 'react';

type Variant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: Variant;
  dot?: boolean;
  children: ReactNode;
}

const Badge = ({ variant = 'neutral', dot = false, children }: BadgeProps) => {
  const classes: Record<Variant, string> = {
    neutral: 'bg-[var(--panel-strong)] text-[var(--text-muted)]',
    success: 'bg-[var(--success-bg)] text-[var(--success-text)]',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning-text)]',
    danger: 'bg-[var(--danger-bg)] text-[var(--danger-text)]',
    info: 'bg-[var(--primary-soft)] text-[var(--primary)]',
  };

  return (
    <span className={`app-pill ${classes[variant]} ${dot ? 'before:content-["●"] before:mr-1.5' : ''}`.trim()}>
      {children}
    </span>
  );
};

export default Badge;
