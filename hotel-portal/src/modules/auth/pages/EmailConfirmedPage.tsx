const EmailConfirmedPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-body auth-body-center">
        <div className="auth-card text-center" style={{ maxWidth: '26rem', width: '100%' }}>
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tp-success-bg)] text-[var(--tp-success-text)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--tp-text)]">Email confirmed</h1>
          <p className="mt-2 text-sm text-[var(--tp-text-soft)]">You can close this tab.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmedPage;
