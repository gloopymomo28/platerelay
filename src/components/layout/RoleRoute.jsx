import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { PageSpinner } from '../ui/Spinner';

/**
 * RoleRoute — supports both:
 *   <RoleRoute allowedRole="donor">  (single role string)
 *   <RoleRoute roles={["donor","admin"]}>  (array of allowed roles)
 */
const RoleRoute = ({ children, allowedRole, roles = [] }) => {
  const { user, loading, initialized } = useAuthStore();

  if (!initialized || loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  // Build the effective allow-list
  const allowed = allowedRole
    ? [allowedRole]
    : roles;

  if (allowed.length > 0 && !allowed.includes(user.role)) {
    if (user.role === 'donor') return <Navigate to="/donor/dashboard" replace />;
    if (user.role === 'recipient') return <Navigate to="/recipient/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
export { RoleRoute };
