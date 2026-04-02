import { ReactNode } from 'react';

interface ManagementPageShellProps {
  title: string;
  subtitle?: string;
  controls?: ReactNode;
  filters?: ReactNode;
  list: ReactNode;
  detail: ReactNode;
}

const ManagementPageShell = ({
  title,
  subtitle,
  controls,
  filters,
  list,
  detail,
}: ManagementPageShellProps) => {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="sovereign-label">Admin</div>
          <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[var(--text)]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </div>

        {controls ? <div className="flex flex-wrap gap-3">{controls}</div> : null}
      </section>

      {filters ? <section>{filters}</section> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.95fr)]">
        <div className="min-w-0">{list}</div>
        <aside className="min-w-0">{detail}</aside>
      </section>
    </div>
  );
};

export default ManagementPageShell;
