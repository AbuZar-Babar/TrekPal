import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import LoginForm from './modules/auth/components/LoginForm';
import RegisterForm from './modules/auth/components/RegisterForm';
import Dashboard from './modules/dashboard/components/Dashboard';
import VehicleList from './modules/transport/components/VehicleList';
import VehicleForm from './modules/transport/components/VehicleForm';
import HotelList from './modules/hotels/components/HotelList';
import HotelForm from './modules/hotels/components/HotelForm';

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
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-8">
              <Dashboard />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transport"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-8">
              <VehicleList />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transport/new"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-8">
              <VehicleForm />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transport/:id/edit"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-8">
              <VehicleForm />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotels"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-8">
              <HotelList />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotels/new"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-8">
              <HotelForm />
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
