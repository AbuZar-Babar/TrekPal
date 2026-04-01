import { Link, useLocation } from 'react-router-dom';

import AuthShell from './AuthShell';

const PendingApproval = () => {
  const location = useLocation();
  const { email, name } = (location.state as { email?: string; name?: string }) || {};

  const steps = [
    {
      label: 'Application submitted',
      detail: 'Agency details and KYC documents were received.',
      complete: true,
    },
    {
      label: 'Admin review in progress',
      detail: 'Business documents, regulator details, and identity proofs are being checked.',
      complete: false,
      active: true,
    },
    {
      label: 'Portal access enabled',
      detail: 'Login opens once the agency passes approval.',
      complete: false,
    },
  ];

  return (
    <AuthShell
      badge="Approval queue"
      title="Your agency application is under review"
      subtitle="The admin team is reviewing submitted documents before enabling login and marketplace access."
      panelTitle="A calmer approval handoff."
      panelText="The pending state is part of the agency portal journey. Once approval completes, the same workspace opens directly into marketplace, bookings, and inventory operations."
      panelPoints={[
        'Submitted agencies remain blocked from sign-in until approval.',
        'The review checks business identity, documentation, and regulator details.',
        'You can return with the same email once approval is complete.',
      ]}
    >
      <div className="app-card px-6 py-6 md:px-8 md:py-8">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--warning-bg)] text-[var(--warning-text)]">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
                {name || 'Agency application'}
              </div>
              <p className="mt-1 text-sm leading-7 text-[var(--text-muted)]">
                {email || 'Your business email'} is in the approval queue. You will be able to sign in after admin verification completes.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {steps.map((step, index) => (
              <div key={step.label} className="app-card-subtle flex items-start gap-4 px-5 py-4">
                <div
                  className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${
                    step.complete
                      ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                      : step.active
                        ? 'bg-[var(--warning-bg)] text-[var(--warning-text)]'
                        : 'bg-[var(--panel-strong)] text-[var(--text-soft)]'
                  }`}
                >
                  {step.complete ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-tight text-[var(--text)]">{step.label}</div>
                  <p className="mt-1 text-sm leading-7 text-[var(--text-muted)]">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] px-5 py-4 text-sm leading-7 text-[var(--text-muted)]">
            Try logging in later with the same credentials after approval. If you need to resubmit, return to the registration flow.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="app-btn-primary h-12 flex-1 px-5 text-sm">
              Return to sign in
            </Link>
            <Link to="/signup" className="app-btn-secondary h-12 flex-1 px-5 text-sm">
              Edit registration
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
};

export default PendingApproval;
