
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rank-teal"></div>
      </div>
    );
  }
  
  // Redirect to auth page if not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
