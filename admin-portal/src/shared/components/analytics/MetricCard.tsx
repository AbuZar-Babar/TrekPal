import { ReactNode } from 'react';
import PatternCardChrome from '../UI/PatternCardChrome';

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  action?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
}

const MetricCard = ({ label, value, hint, action, icon, onClick }: MetricCardProps) => {
  const content = (
    <>
      <PatternCardChrome />
      <div className="sovereign-pattern-card-content">
        {icon ? <span className="sovereign-pattern-icon">{icon}</span> : null}
        <div className="mt-6 text-[1.65rem] font-headline font-extrabold tracking-tight text-[var(--text)]">
          {value}
        </div>
        <div className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
          {label}
        </div>
        {hint ? <p className="mt-3 max-w-[26ch] text-sm leading-7 text-[var(--text-muted)]">{hint}</p> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="sovereign-pattern-card w-full p-6 text-left hover:-translate-y-0.5"
      >
        {content}
      </button>
    );
  }

  return <article className="sovereign-pattern-card p-6">{content}</article>;
};

export default MetricCard;
