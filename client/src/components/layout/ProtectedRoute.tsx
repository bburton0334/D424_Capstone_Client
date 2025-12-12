/**
 * ProtectedRoute Component
 * Wrapper for routes that require authentication
 */

import { Navigate, useLocation } from 'react-router-dom';
import { User } from '../../types';

interface ProtectedRouteProps {
  user: User | null;
  children: React.ReactNode;
}

export default function ProtectedRoute({ user, children }: ProtectedRouteProps) {
  const location = useLocation();

  if (!user) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

