import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth0 } from '@auth0/auth0-react';
import { useRole } from './useRole';

export default function RequireAdmin({ children }) {
  const { loginWithRedirect } = useAuth0();
  const { role, loading, isAuthenticated } = useRole();

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (!isAuthenticated) { loginWithRedirect(); return null; }
  if (role !== 'admin') return <Navigate to="/" replace />;

  return children;
}