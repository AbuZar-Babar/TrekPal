import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Layout from './shared/components/Layout/Layout';
import AdminLoginForm from './modules/auth/components/AdminLoginForm';
import Dashboard from './modules/dashboard/components/Dashboard';
import AgencyList from './modules/agencies/components/AgencyList';
import HotelApprovalList from './modules/hotels/components/HotelApprovalList';
import VehicleApprovalList from './modules/vehicles/components/VehicleApprovalList';
import ComingSoon from './shared/components/ComingSoon';

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
        path="/hotels"
        element={
          <ProtectedRoute>
            <Layout>
              <HotelApprovalList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <Layout>
              <VehicleApprovalList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <ComingSoon
                title="User Management"
                description="Manage platform users, view profiles, and handle account issues."
              />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <ComingSoon
                title="Reports & Analytics"
                description="Detailed reports, exports, and advanced analytics are on the way."
              />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
