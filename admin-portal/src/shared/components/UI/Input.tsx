import React, { forwardRef } from 'react';

type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  inputSize?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'py-2 text-sm',
  md: 'py-2.5 text-sm',
  lg: 'py-3 text-base',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, inputSize = 'md', className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    const hasError = Boolean(error);

    return (
      <div className="space-y-1.5">
        {label && inputId && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-muted)]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-soft)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'block w-full rounded-xl border bg-[var(--surface)] text-[var(--text)] shadow-sm transition-all duration-200 placeholder:text-[var(--text-soft)]',
              'focus:outline-none focus:ring-2 focus:ring-white/15',
              hasError
                ? 'border-red-300 focus:border-red-400'
                : 'border-[var(--border)] focus:border-white/30',
              leftIcon ? 'pl-10 pr-3' : 'px-3',
              sizeClasses[inputSize],
              className,
            ].join(' ')}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-[var(--text-soft)]">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

