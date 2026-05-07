import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthShellProps {
  badge: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

const AuthShell = ({
  badge,
  title,
  subtitle,
  children,
}: AuthShellProps) => {
  return (
    <div className="min-h-screen bg-[#f3f5f9] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link to="/" className="mb-5 flex items-center gap-3 text-[var(--text)] no-underline">
            <div className="rounded-2xl bg-[#0b8ccf] p-3 text-white shadow-md">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13h18l-1.5-5.25A2 2 0 0017.58 6H6.42a2 2 0 00-1.92 1.75L3 13zm2 0v4a1 1 0 001 1h1a2 2 0 104 0h2a2 2 0 104 0h1a1 1 0 001-1v-4" />
              </svg>
            </div>
          </Link>
          <h1 className="text-[2.2rem] font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-base text-slate-600">{subtitle}</p>
          <div className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b8ccf]">{badge}</div>
        </div>

        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthShell;
