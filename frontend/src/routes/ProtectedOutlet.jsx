import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProtectedOutlet({ adminOnly = false }) {
  const { isAuthenticated, initialized, user } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!initialized) return <LoadingSpinner fullScreen text="Loading..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
