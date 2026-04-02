import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  action?: ReactNode;
  onClick?: () => void;
}

const MetricCard = ({ label, value, hint, action, onClick }: MetricCardProps) => {
  const content = (
    <>
      <div className="sovereign-label">{label}</div>
      <div className="mt-3 font-headline text-4xl font-extrabold tracking-tight text-[var(--text)]">
        {value}
      </div>
      {hint ? <p className="mt-3 text-sm text-[var(--text-muted)]">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="sovereign-kpi w-full p-6 text-left transition-transform duration-200 hover:-translate-y-0.5"
      >
        {content}
      </button>
    );
  }

  return <article className="sovereign-kpi p-6">{content}</article>;
};

export default MetricCard;
