import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: ReactNode;
  delta?: { value: string; direction?: 'up' | 'down' };
  onClick?: () => void;
}

const StatCard = ({ label, value, icon, hint, delta, onClick }: StatCardProps) => {
  const inner = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-xs font-medium text-[var(--text-muted)] mb-1.5">{label}</div>
        <div className="text-2xl font-semibold tracking-tight text-[var(--text)] tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {(hint || delta) && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--text-soft)]">
            {delta && (
              <span className={delta.direction === 'up' ? 'text-[var(--success-text)]' : 'text-[var(--danger-text)]'}>
                {delta.direction === 'up' ? '↑' : '↓'} {delta.value}
              </span>
            )}
            {hint && <span>{hint}</span>}
          </div>
        )}
      </div>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
          {icon}
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="app-card w-full text-left p-5 hover:border-[var(--primary)] transition-colors"
      >
        {inner}
      </button>
    );
  }

  return <div className="app-card p-5">{inner}</div>;
};

export default StatCard;
