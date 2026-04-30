const ChatPage = () => {
  return (
    <div className="space-y-6">
      <section className="page-hero">
        <div className="space-y-3">
          <span className="app-pill app-pill-neutral">Offer chat</span>
          <h1 className="page-title">Chat is coming soon</h1>
          <p className="page-copy max-w-3xl">
            This feature is temporarily disabled and will be available in a future update.
          </p>
        </div>
      </section>

      <section className="surface min-h-[360px]">
        <div className="flex min-h-[360px] items-center justify-center text-center">
          <div>
            <svg
              className="mx-auto h-10 w-10 text-[var(--text-soft)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M7 8h10M7 12h7m-9 8l-4-4V6a2 2 0 012-2h18a2 2 0 012 2v10a2 2 0 01-2 2H7z"
              />
            </svg>
            <p className="mt-4 text-sm text-[var(--text-muted)]">Coming soon</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChatPage;
