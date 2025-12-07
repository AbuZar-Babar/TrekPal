import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Layout from './shared/components/Layout/Layout';
import AdminLoginForm from './modules/auth/components/AdminLoginForm';
import AdminSignupForm from './modules/auth/components/AdminSignupForm';
import Dashboard from './modules/dashboard/components/Dashboard';
import AgencyList from './modules/agencies/components/AgencyList';
import HotelApprovalList from './modules/hotels/components/HotelApprovalList';
import VehicleApprovalList from './modules/vehicles/components/VehicleApprovalList';

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
        <Route path="/signup" element={<AdminSignupForm />} />
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
                <div>
                  <h1 className="text-2xl font-bold mb-4">Agencies</h1>
                  <AgencyList />
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotels"
          element={
            <ProtectedRoute>
              <Layout>
                <div>
                  <h1 className="text-2xl font-bold mb-4">Hotels</h1>
                  <HotelApprovalList />
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <Layout>
                <div>
                  <h1 className="text-2xl font-bold mb-4">Transport Vehicles</h1>
                  <VehicleApprovalList />
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <div>
                  <h1 className="text-2xl font-bold mb-4">Users</h1>
                  <p className="text-gray-600">User management coming soon...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <div>
                  <h1 className="text-2xl font-bold mb-4">Reports</h1>
                  <p className="text-gray-600">Reports coming soon...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
  );
}

export default App;
