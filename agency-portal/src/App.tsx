import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Layout from './shared/components/Layout/Layout';
import LoginForm from './modules/auth/components/LoginForm';
import RegisterForm from './modules/auth/components/RegisterForm';
import PendingApproval from './modules/auth/components/PendingApproval';
import Dashboard from './modules/dashboard/components/Dashboard';
import VehicleList from './modules/transport/components/VehicleList';
import VehicleForm from './modules/transport/components/VehicleForm';
import HotelList from './modules/hotels/components/HotelList';
import HotelForm from './modules/hotels/components/HotelForm';
import TripRequestList from './modules/tripRequests/components/TripRequestList';
import BookingList from './modules/bookings/components/BookingList';
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
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<RegisterForm />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
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
        path="/transport"
        element={
          <ProtectedRoute>
            <Layout>
              <VehicleList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transport/new"
        element={
          <ProtectedRoute>
            <Layout>
              <VehicleForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transport/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <VehicleForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotels"
        element={
          <ProtectedRoute>
            <Layout>
              <HotelList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotels/new"
        element={
          <ProtectedRoute>
            <Layout>
              <HotelForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotels/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <HotelForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip-requests"
        element={
          <ProtectedRoute>
            <Layout>
              <TripRequestList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/packages"
        element={
          <ProtectedRoute>
            <Layout>
              <ComingSoon
                title="Tour Packages"
                description="Create and manage tour packages with itineraries, pricing, and destination details. This feature is coming soon!"
                icon={
                  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                }
              />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Layout>
              <BookingList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
