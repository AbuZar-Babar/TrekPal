import { Link, useLocation } from 'react-router-dom';

import AuthShell from './AuthShell';

const PendingApproval = () => {
  const location = useLocation();
  const { email, name } = (location.state as { email?: string; name?: string }) || {};

  const steps = [
    'Application submitted',
    'Admin review in progress',
    'Login unlocks after approval',
  ];

  return (
    <AuthShell
      badge="Pending review"
      title="Application under review"
      subtitle="Your agency stays in the waiting queue until admin approval."
    >
      <div className="app-card px-6 py-6 md:px-8 md:py-8">
        <div className="space-y-6">
          <div className="rounded-[22px] border border-[var(--warning-bg)] bg-[var(--warning-bg)] px-5 py-5">
            <div className="text-lg font-semibold tracking-tight text-[var(--warning-text)]">
              {name || 'Agency application'}
            </div>
            <p className="mt-2 text-sm text-[var(--warning-text)]">
              {email || 'Your email'} is waiting for admin approval.
            </p>
          </div>

          <div className="grid gap-3">
            {steps.map((step, index) => (
              <div key={step} className="app-card-subtle flex items-center gap-4 px-5 py-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    index === 0
                      ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                      : index === 1
                        ? 'bg-[var(--warning-bg)] text-[var(--warning-text)]'
                        : 'bg-[var(--panel-strong)] text-[var(--text-soft)]'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="text-sm font-medium text-[var(--text)]">{step}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="app-btn-primary h-12 flex-1 px-5 text-sm">
              Go to sign in
            </Link>
            <Link to="/signup" className="app-btn-secondary h-12 flex-1 px-5 text-sm">
              Register again
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
};

export default PendingApproval;
