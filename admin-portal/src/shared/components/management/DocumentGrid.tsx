interface DocumentEntry {
  label: string;
  url: string;
}

interface DocumentGridProps {
  entries: DocumentEntry[];
  emptyMessage: string;
}

const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

const looksLikeImage = (url: string) => {
  const cleanUrl = url.split('?')[0].toLowerCase();
  return imageExtensions.some((extension) => cleanUrl.endsWith(extension));
};

const DocumentGrid = ({ entries, emptyMessage }: DocumentGridProps) => {
  if (entries.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--text-soft)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {entries.map((entry) => (
        <a
          key={`${entry.label}-${entry.url}`}
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface-low)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          {looksLikeImage(entry.url) ? (
            <img src={entry.url} alt={entry.label} className="h-24 w-full object-cover" />
          ) : (
            <div className="flex h-24 items-center justify-center text-[var(--text-soft)]">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M7 21h10a2 2 0 002-2V8l-6-6H7a2 2 0 00-2 2v15a2 2 0 002 2z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 3v5h5" />
              </svg>
            </div>
          )}
          <div className="px-3 py-3">
            <div className="text-xs font-semibold text-[var(--text)]">{entry.label}</div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
              Open
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default DocumentGrid;
