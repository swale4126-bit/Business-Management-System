import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from '../components/ui/LoadingSpinner';

export const RoleRoute = ({ roles }) => {
  const { user, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user || !hasRole(roles)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
