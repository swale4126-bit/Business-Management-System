import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from '../components/ui/LoadingSpinner';

export const ProtectedRoute = ({ requirePasswordChange = true }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading || (isAuthenticated && !user)) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requirePasswordChange && user?.mustChangePassword) {
    return <Navigate to="/force-change-password" replace />;
  }

  // If on force-change-password but they don't need to change it, send to dashboard
  if (!requirePasswordChange && !user?.mustChangePassword && location.pathname === '/force-change-password') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
