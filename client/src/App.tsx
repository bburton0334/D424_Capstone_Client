/**
 * Main App Component
 * Sets up routing and authentication state
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './services/auth';
import { User } from './types';

// Layout
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import ShipmentNew from './pages/ShipmentNew';
import ShipmentDetail from './pages/ShipmentDetail';
import Tracking from './pages/Tracking';
import Weather from './pages/Weather';
import Reports from './pages/Reports';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl animate-float inline-block">✈️</span>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Show navbar only for authenticated users */}
      {user && <Navbar user={user} onLogout={handleLogout} />}

      <main className={user ? 'min-h-[calc(100vh-4rem)]' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <Landing />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments"
            element={
              <ProtectedRoute user={user}>
                <Shipments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments/new"
            element={
              <ProtectedRoute user={user}>
                <ShipmentNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments/:id"
            element={
              <ProtectedRoute user={user}>
                <ShipmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking"
            element={
              <ProtectedRoute user={user}>
                <Tracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute user={user}>
                <Weather />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute user={user}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to dashboard or landing */}
          <Route 
            path="*" 
            element={<Navigate to={user ? '/dashboard' : '/'} replace />} 
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;

