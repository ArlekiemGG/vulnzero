
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // While checking authentication status, show loading or nothing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cybersec-black">
        <div className="animate-pulse text-cybersec-neongreen">Cargando...</div>
      </div>
    );
  }
  
  // If not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
