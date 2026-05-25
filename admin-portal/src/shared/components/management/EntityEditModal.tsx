import { AnimatePresence, motion } from 'framer-motion';

import { PortalModalTransition } from '../motion/portalMotion';

interface EditFieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'date' | 'select';
  placeholder?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
}

interface EntityEditModalProps {
  open: boolean;
  title: string;
  fields: EditFieldConfig[];
  values: Record<string, string>;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onChange: (name: string, value: string) => void;
  onSubmit: () => void;
}

const EntityEditModal = ({
  open,
  title,
  fields,
  values,
  saving = false,
  error,
  onClose,
  onChange,
  onSubmit,
}: EntityEditModalProps) => {
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
          <PortalModalTransition className="relative w-full max-w-2xl rounded-[20px] border border-[var(--border)] bg-[var(--background)] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="sovereign-label">Edit</div>
                <h3 className="mt-2 font-headline text-2xl font-bold text-[var(--text)]">{title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="sovereign-button-secondary h-11 px-4"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {fields.map((field) => {
                const value = values[field.name] ?? '';
                if (field.type === 'textarea') {
                  return (
                    <label key={field.name} className="md:col-span-2">
                      <div className="mb-2 text-sm font-semibold text-[var(--text)]">{field.label}</div>
                      <textarea
                        rows={4}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(event) => onChange(field.name, event.target.value)}
                        className="sovereign-input min-h-[112px] resize-y"
                      />
                    </label>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <label key={field.name}>
                      <div className="mb-2 text-sm font-semibold text-[var(--text)]">{field.label}</div>
                      <select
                        value={value}
                        onChange={(event) => onChange(field.name, event.target.value)}
                        className="sovereign-input"
                      >
                        {(field.options ?? []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                }

                return (
                  <label key={field.name}>
                    <div className="mb-2 text-sm font-semibold text-[var(--text)]">{field.label}</div>
                    <input
                      type={field.type || 'text'}
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(event) => onChange(field.name, event.target.value)}
                      className="sovereign-input"
                    />
                  </label>
                );
              })}
            </div>

            {error ? (
              <div className="mt-4 rounded-[14px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="sovereign-button-secondary h-11 px-5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={saving}
                className="sovereign-button-primary h-11 px-5 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </PortalModalTransition>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default EntityEditModal;
