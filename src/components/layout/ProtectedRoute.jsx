import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { PageSpinner } from '../ui/Spinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading, initialized } = useAuthStore();

  if (!initialized || loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
