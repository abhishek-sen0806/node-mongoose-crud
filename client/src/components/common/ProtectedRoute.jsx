import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 */

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default ProtectedRoute;

