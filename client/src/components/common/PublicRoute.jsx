import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';
import LoadingSpinner from './LoadingSpinner';

/**
 * Public Route Component
 * Redirects authenticated users away from login/register
 */

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    // Redirect to the page they came from or dashboard
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoute;

