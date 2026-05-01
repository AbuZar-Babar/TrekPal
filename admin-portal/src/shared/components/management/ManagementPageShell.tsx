import { ReactNode } from 'react';

interface ManagementPageShellProps {
  controls?: ReactNode;
  filters?: ReactNode;
  list: ReactNode;
  detail?: ReactNode;
}

const ManagementPageShell = ({
  controls,
  filters,
  list,
  detail,
}: ManagementPageShellProps) => {
  return (
    <div className="space-y-6">
      {controls ? <section className="flex flex-wrap justify-end gap-3">{controls}</section> : null}

      {filters ? <section>{filters}</section> : null}

      {detail ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.95fr)]">
          <div className="min-w-0">{list}</div>
          <aside className="min-w-0">{detail}</aside>
        </section>
      ) : (
        <section className="min-w-0">{list}</section>
      )}
    </div>
  );
};

export default ManagementPageShell;
