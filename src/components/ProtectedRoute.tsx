
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component ensures users are authenticated before accessing protected pages
 * Includes safety mechanisms to prevent infinite loops and handle edge cases
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [redirectedToAuth, setRedirectedToAuth] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const redirectAttemptedRef = useRef(false);
  const toastShownRef = useRef(false);
  
  // Use useRef for handling timeouts to avoid memory leaks
  const authCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset redirect flags when component unmounts
  useEffect(() => {
    return () => {
      redirectAttemptedRef.current = false;
      toastShownRef.current = false;
    };
  }, []);
  
  // Detect potential infinite loading loops
  useEffect(() => {
    if (loading) {
      setLoadingCount(prevCount => prevCount + 1);
    }
  }, [loading]);
  
  // Store current route for redirection after login - only once
  useEffect(() => {
    if (!loading && !user && !redirectedToAuth && !redirectAttemptedRef.current) {
      redirectAttemptedRef.current = true; // Prevent multiple redirect attempts
      localStorage.setItem('redirectAfterLogin', location.pathname);
      setRedirectedToAuth(true);
    }
  }, [user, loading, location, redirectedToAuth]);
  
  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current);
      }
      
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);
  
  // Safety mechanism for handling potential infinite loops
  useEffect(() => {
    if (loadingCount > 5) {
      console.error("Potential infinite loading loop detected in ProtectedRoute");
      
      authCheckTimeoutRef.current = setTimeout(() => {
        if (loading) {
          toast({
            title: "Problema detectado",
            description: "Se ha detectado un problema al verificar tu sesión. Por favor, intenta iniciar sesión de nuevo.",
            variant: "destructive"
          });
          
          // Force navigation to auth page
          window.location.href = '/auth';
        }
      }, 3000);
    }
  }, [loadingCount, loading]);
  
  // Delayed loading indicator to prevent flashing
  const [showLoading, setShowLoading] = useState(false);
  
  useEffect(() => {
    if (loading) {
      // Only show loading indicator after 300ms to prevent flashing
      loadingTimerRef.current = setTimeout(() => setShowLoading(true), 300);
    } else {
      setShowLoading(false);
    }
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [loading]);
  
  // Show loading state
  if (loading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cybersec-black">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cybersec-neongreen"></div>
          <p className="mt-4 text-cybersec-neongreen">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to auth page if not authenticated (but only show toast once)
  if (!loading && !user) {
    if (!redirectedToAuth && !toastShownRef.current) {
      toastShownRef.current = true;
      toast({
        title: "Acceso restringido",
        description: "Debes iniciar sesión para acceder a esta página",
        variant: "destructive"
      });
    }
    
    return <Navigate to="/auth" replace />;
  }
  
  // Render children with error boundary protection
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default ProtectedRoute;
