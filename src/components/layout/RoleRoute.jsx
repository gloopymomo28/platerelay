import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { PageSpinner } from '../ui/Spinner';

const RoleRoute = ({ children, roles = [] }) => {
  const { user, loading, initialized } = useAuthStore();

  if (!initialized || loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !roles.includes(user.role)) {
    if (user.role === 'donor') return <Navigate to="/donor/dashboard" replace />;
    if (user.role === 'recipient') return <Navigate to="/recipient/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
