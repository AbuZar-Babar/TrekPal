import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { PortalPageTransition } from '../motion/portalMotion';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="portal-shell bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <div className="portal-content">
        <Header />
        <main className="portal-main">
          <div className="portal-container">
            <AnimatePresence mode="wait" initial={false}>
              <PortalPageTransition key={`${location.pathname}${location.search}`}>
                {children}
              </PortalPageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
