
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [redirected, setRedirected] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  
  // Change: Use useRef instead of useState for timeout
  const authCheckTimeoutRef = useRef<number | null>(null);
  
  // Anti-infinite loop protection
  useEffect(() => {
    if (loading) {
      setLoadingCount(prev => prev + 1);
    }
  }, [loading]);
  
  useEffect(() => {
    // Store current route if no active session
    // for redirection after login
    if (!loading && !user && !redirected) {
      localStorage.setItem('redirectAfterLogin', location.pathname);
      setRedirected(true); // Prevent multiple redirects
    }
  }, [user, loading, location, redirected]);
  
  // Clear any existing timeout when component unmounts
  useEffect(() => {
    return () => {
      if (authCheckTimeoutRef.current !== null) {
        clearTimeout(authCheckTimeoutRef.current);
      }
    };
  }, []);
  
  // Detect potential infinite loops with loading state
  useEffect(() => {
    if (loadingCount > 5) {
      console.error("Potential infinite loading loop detected in ProtectedRoute");
      
      // Force break the potential loop after 3 seconds
      authCheckTimeoutRef.current = window.setTimeout(() => {
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
  
  // Prevent multiple loading indicators for better UX
  const [showLoading, setShowLoading] = useState(false);
  
  useEffect(() => {
    let timer: number;
    if (loading) {
      // Only show loading indicator after 300ms to prevent flashing
      timer = window.setTimeout(() => setShowLoading(true), 300);
    } else {
      setShowLoading(false);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [loading]);
  
  // Mientras verificamos el estado de autenticación, mostramos loading
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
  
  // Si no está autenticado, redireccionamos a la página de auth con notificación
  if (!loading && !user) {
    // Prevent toast spam - only show once
    if (!redirected) {
      toast({
        title: "Acceso restringido",
        description: "Debes iniciar sesión para acceder a esta página",
        variant: "destructive"
      });
    }
    
    return <Navigate to="/auth" replace />;
  }
  
  // Si está autenticado, renderizamos los children dentro de un ErrorBoundary
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default ProtectedRoute;
