import { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

/**
 * Page-level title bar. Each page owns its title — header chrome stays minimal.
 */
const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <div className="ap-page-header">
      <div className="min-w-0">
        <h1 className="ap-page-title">{title}</h1>
        {subtitle ? <p className="ap-page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="ap-page-actions">{actions}</div> : null}
    </div>
  );
};

export default PageHeader;
