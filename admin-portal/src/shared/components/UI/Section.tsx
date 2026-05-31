import { ReactNode } from 'react';

interface SectionProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Untyped grouping with an optional inline header — used to break up
 * sections inside a page without spawning multiple Card containers.
 */
const Section = ({ title, description, action, children, className = '' }: SectionProps) => {
  return (
    <section className={`space-y-3 ${className}`.trim()}>
      {(title || action) && (
        <header className="flex items-end justify-between gap-3">
          <div>
            {title ? (
              <h2 className="text-sm font-semibold text-[var(--text)] tracking-tight">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-[var(--text-soft)]">{description}</p>
            ) : null}
          </div>
          {action ? <div>{action}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
};

export default Section;
