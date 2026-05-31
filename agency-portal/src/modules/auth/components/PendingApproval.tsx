import { Link, useLocation } from 'react-router-dom';
import AuthShell from './AuthShell';

const steps = [
  { label: 'Application submitted',      done: true,    icon: 'check' },
  { label: 'Admin review in progress',   done: false,   icon: 'clock' },
  { label: 'Approval email sent to you', done: false,   icon: 'mail'  },
  { label: 'Login unlocks',              done: false,   icon: 'lock'  },
];

const StepIcon = ({ type, done, active }: { type: string; done: boolean; active: boolean }) => {
  const cls = `flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
    done   ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]' :
    active ? 'border-[var(--warning-text)] bg-[var(--warning-bg)] text-[var(--warning-text)]' :
             'border-[var(--border-strong)] bg-[var(--panel-subtle)] text-[var(--text-soft)]'
  }`;

  const paths: Record<string, string> = {
    check: 'M5 13l4 4L19 7',
    clock: 'M12 8v4l3 3M12 22a10 10 0 100-20 10 10 0 000 20z',
    mail:  'M3 8l9 6 9-6M3 8v11a2 2 0 002 2h14a2 2 0 002-2V8M3 8a2 2 0 012-2h14a2 2 0 012 2',
    lock:  'M12 17a2 2 0 100-4 2 2 0 000 4zM6 8V7a6 6 0 0112 0v1m-1 0H7a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2v-9a2 2 0 00-2-2z',
  };

  return (
    <div className={cls}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d={paths[type]} />
      </svg>
    </div>
  );
};

const PendingApproval = () => {
  const location = useLocation();
  const { email, name } = (location.state as { email?: string; name?: string }) || {};

  return (
    <AuthShell variant="login" maxWidth="30rem">
      <div className="auth-card text-center">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--warning-bg)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-[var(--warning-text)]">
            <path d="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h1 className="text-[1.25rem] font-semibold tracking-tight text-[var(--text)]">
          Application under review
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-soft)]">
          {name ? <><strong className="text-[var(--text)]">{name}</strong> — </> : null}
          {email || 'Your application'} is awaiting admin approval.
        </p>

        {/* Timeline */}
        <div className="mt-7 space-y-3 text-left">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <StepIcon type={s.icon} done={s.done} active={i === 1} />
              <div>
                <div className={`text-sm font-medium ${s.done ? 'text-[var(--text)]' : i === 1 ? 'text-[var(--warning-text)]' : 'text-[var(--text-soft)]'}`}>
                  {s.label}
                </div>
                {i === 1 && (
                  <div className="text-xs text-[var(--text-soft)]">Usually within 1–2 business days</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to="/login" className="app-btn-primary app-btn-md flex-1 px-5">
            Back to sign in
          </Link>
          <Link to="/signup" className="app-btn-secondary app-btn-md flex-1 px-5">
            New application
          </Link>
        </div>
      </div>
    </AuthShell>
  );
};

export default PendingApproval;
