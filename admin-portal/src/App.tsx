import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Layout from './shared/components/Layout/Layout';
import AdminLoginForm from './modules/auth/components/AdminLoginForm';
import Dashboard from './modules/dashboard/components/Dashboard';
import AgencyList from './modules/agencies/components/AgencyList';
import UserList from './modules/users/components/UserList';
import ReportDashboard from './modules/reports/components/ReportDashboard';
import InventoryPage from './modules/inventory/components/InventoryPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginForm />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agencies"
        element={
          <ProtectedRoute>
            <Layout>
              <AgencyList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/travelers"
        element={
          <ProtectedRoute>
            <Layout>
              <UserList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Layout>
              <InventoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/users" element={<Navigate to="/travelers" replace />} />
      <Route path="/hotels" element={<Navigate to="/inventory?type=hotels" replace />} />
      <Route path="/vehicles" element={<Navigate to="/inventory?type=vehicles" replace />} />
      <Route path="/reports" element={<Navigate to="/analytics" replace />} />
      <Route path="/activity" element={<Navigate to="/analytics" replace />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
