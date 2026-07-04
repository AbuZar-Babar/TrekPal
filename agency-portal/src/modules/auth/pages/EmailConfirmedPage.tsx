const EmailConfirmedPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] px-6">
      <div className="app-card w-full max-w-md px-8 py-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-bg)] text-[var(--success-text)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Email confirmed</h1>
        <p className="mt-2 text-sm text-[var(--text-soft)]">You can close this tab.</p>
      </div>
    </div>
  );
};

export default EmailConfirmedPage;
