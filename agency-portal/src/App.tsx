import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';

import LoginForm from './modules/auth/components/LoginForm';
import PendingApproval from './modules/auth/components/PendingApproval';
import RegisterForm from './modules/auth/components/RegisterForm';
import BookingList from './modules/bookings/components/BookingList';
import Dashboard from './modules/dashboard/components/Dashboard';
import HotelForm from './modules/hotels/components/HotelForm';
import HotelList from './modules/hotels/components/HotelList';
import AgencyProfile from './modules/profile/components/AgencyProfile';
import BusinessStatus from './modules/profile/components/BusinessStatus';
import TripRequestList from './modules/tripRequests/components/TripRequestList';
import VehicleForm from './modules/transport/components/VehicleForm';
import VehicleList from './modules/transport/components/VehicleList';
import Layout from './shared/components/Layout/Layout';
import { RootState } from './store';

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
        element={(
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/trip-requests"
        element={(
          <ProtectedRoute>
            <Layout>
              <TripRequestList />
            </Layout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/bookings"
        element={(
          <ProtectedRoute>
            <Layout>
              <BookingList />
            </Layout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/hotels"
        element={(
          <ProtectedRoute>
            <Layout>
              <HotelList />
            </Layout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/hotels/new"
        element={(
          <ProtectedRoute>
            <Layout>
              <HotelForm />
            </Layout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/hotels/:id/edit"
        element={(
          <ProtectedRoute>
            <Layout>
              <HotelForm />
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
      <Route
        path="/profile"
        element={(
          <ProtectedRoute>
            <Layout>
              <AgencyProfile />
            </Layout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/status"
        element={(
          <ProtectedRoute>
            <Layout>
              <BusinessStatus />
            </Layout>
          </ProtectedRoute>
        )}
      />

      <Route path="/packages" element={<Navigate to="/status" replace />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
