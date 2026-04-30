import { ReactNode } from 'react';

interface EntityDetailModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}

const EntityDetailModal = ({ open, title, subtitle, children, onClose }: EntityDetailModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-[var(--border)] bg-[var(--background)] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="sovereign-label">Details</div>
            <h3 className="mt-2 font-headline text-2xl font-bold text-[var(--text)]">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="sovereign-button-secondary h-11 px-4">
            Close
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default EntityDetailModal;
