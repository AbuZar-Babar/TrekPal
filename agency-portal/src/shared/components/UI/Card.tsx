import { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

const Card = ({ title, eyebrow, action, children, className = '' }: CardProps) => {
  return (
    <div className={`app-card ${className}`.trim()}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-[var(--border)]">
          <div>
            {eyebrow && <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">{eyebrow}</div>}
            {title && <div className="text-sm font-semibold text-[var(--text)]">{title}</div>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
