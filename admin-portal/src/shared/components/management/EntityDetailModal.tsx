import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { PortalModalTransition } from '../motion/portalMotion';

interface EntityDetailModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}

const EntityDetailModal = ({ open, title, subtitle, children, onClose }: EntityDetailModalProps) => {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <motion.div
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <PortalModalTransition className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[20px] border border-[var(--border)] bg-[var(--background)] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.18)]">
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
          </PortalModalTransition>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default EntityDetailModal;
