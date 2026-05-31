import { ReactNode } from 'react';
import PatternCardChrome from './PatternCardChrome';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: ReactNode;
  delta?: { value: string; direction?: 'up' | 'down' | 'flat' };
  onClick?: () => void;
}

/**
 * KPI tile with the sovereign pattern-card hover effect (shine + animated tiles + grid lines).
 * Clickable when onClick is provided.
 */
const StatCard = ({ label, value, icon, hint, delta, onClick }: StatCardProps) => {
  const inner = (
    <>
      {/* Pattern chrome — shine + grid tiles + lines, revealed on hover via CSS */}
      <PatternCardChrome />

      {/* Content sits above the chrome */}
      <div className="sovereign-pattern-card-content p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-[var(--text-muted)] leading-snug">{label}</span>
          {icon ? (
            <span className="sovereign-pattern-icon shrink-0" style={{ width: '2rem', height: '2rem' }}>
              {icon}
            </span>
          ) : null}
        </div>

        <div className="mt-3 text-[1.85rem] font-semibold tracking-tight text-[var(--text)] leading-none tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {(delta || hint) ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            {delta ? (
              <span
                className={
                  delta.direction === 'up'
                    ? 'text-[var(--success-text)]'
                    : delta.direction === 'down'
                    ? 'text-[var(--danger-text)]'
                    : ''
                }
              >
                {delta.direction === 'up' ? '↑' : delta.direction === 'down' ? '↓' : '·'}{' '}
                {delta.value}
              </span>
            ) : null}
            {hint ? <span>{hint}</span> : null}
          </div>
        ) : null}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="sovereign-pattern-card w-full text-left"
      >
        {inner}
      </button>
    );
  }

  return <div className="sovereign-pattern-card">{inner}</div>;
};

export default StatCard;
