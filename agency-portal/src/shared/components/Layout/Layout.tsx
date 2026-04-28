import { ReactNode } from 'react';

import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="portal-shell bg-[var(--bg)] text-[var(--text)]">
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="portal-content flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto px-3 pb-24 pt-3 sm:px-4 md:px-6 md:pb-10 md:pt-4 xl:px-8">
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
