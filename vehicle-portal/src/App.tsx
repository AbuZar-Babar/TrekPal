import { useEffect, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HashRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import LoginForm from './modules/auth/components/LoginForm';
import PendingApproval from './modules/auth/components/PendingApproval';
import RegisterForm from './modules/auth/components/RegisterForm';
import { getProfile } from './modules/auth/store/authSlice';
import Dashboard from './modules/dashboard/components/Dashboard';
import VehicleForm from './modules/transport/components/VehicleForm';
import VehicleList from './modules/transport/components/VehicleList';
import Layout from './shared/components/Layout/Layout';
import { AppDispatch, RootState } from './store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, authChecked, user, error } = useSelector((state: RootState) => state.auth);
  const hasStoredToken = !!localStorage.getItem('token');

  useEffect(() => {
    if (hasStoredToken && !authChecked && !loading) {
      dispatch(getProfile());
    }
  }, [authChecked, dispatch, hasStoredToken, loading]);

  if (hasStoredToken && !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] px-6">
        <div className="app-card w-full max-w-sm px-6 py-8 text-center">
          <div className="text-sm font-semibold text-[var(--text)]">Checking account</div>
          <p className="mt-2 text-sm text-[var(--text-soft)]">Verifying approval status.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const errorMessage = (error || '').toLowerCase();
    if (errorMessage.includes('pending approval') || errorMessage.includes('pending admin')) {
      return (
        <Navigate
          to="/pending-approval"
          replace
          state={{
            email: user?.email,
            name: user?.name,
          }}
        />
      );
    }

    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/pending-approval" element={<PendingApproval />} />

          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/transport"
            element={(
              <ProtectedRoute>
                <Layout>
                  <VehicleList />
                </Layout>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/transport/new"
            element={(
              <ProtectedRoute>
                <Layout>
                  <VehicleForm />
                </Layout>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/transport/:id/edit"
            element={(
              <ProtectedRoute>
                <Layout>
                  <VehicleForm />
                </Layout>
              </ProtectedRoute>
            )}
          />
          <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
          <Route path="/status" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
