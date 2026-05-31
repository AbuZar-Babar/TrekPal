import { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Linear-style bordered surface. Use for grouping any content.
 * - Pass `title` for a header bar (use eyebrow for an uppercase label above title).
 * - `padded` adds padding to the body; for tables/lists keep it off.
 */
const Card = ({ title, eyebrow, action, padded = false, children, className = '' }: CardProps) => {
  const hasHeader = title || action;
  return (
    <section className={`ap-card ${className}`.trim()}>
      {hasHeader ? (
        <header className="ap-card-header">
          <div className="min-w-0">
            {eyebrow ? <div className="ap-card-eyebrow">{eyebrow}</div> : null}
            {title ? <div className="ap-card-title">{title}</div> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={padded ? 'ap-card-padded' : ''}>{children}</div>
    </section>
  );
};

export default Card;
