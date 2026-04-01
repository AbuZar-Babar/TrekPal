import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto px-4 pb-8 pt-4 md:px-6 xl:px-8">
            <div className="mx-auto w-full max-w-[1680px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
