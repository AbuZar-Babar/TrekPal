import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';

const DashboardLayout: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="portal-shell" style={{ background: 'var(--tp-bg)', color: 'var(--tp-text)' }}>
      <Sidebar />
      <div className="portal-content">
        <Header />
        <main className="portal-main">
          <div className="portal-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
