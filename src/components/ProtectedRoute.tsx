
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Almacenar la ruta actual si no hay sesión activa
    // para redireccionar después de login
    if (!loading && !user) {
      localStorage.setItem('redirectAfterLogin', location.pathname);
    }
  }, [user, loading, location]);
  
  // Mientras verificamos el estado de autenticación, mostramos loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cybersec-black">
        <div className="animate-pulse text-cybersec-neongreen">Cargando...</div>
      </div>
    );
  }
  
  // Si no está autenticado, redireccionamos a la página de auth con notificación
  if (!user) {
    toast({
      title: "Acceso restringido",
      description: "Debes iniciar sesión para acceder a esta página",
      variant: "destructive"
    });
    
    return <Navigate to="/auth" replace />;
  }
  
  // Si está autenticado, renderizamos los children
  return <>{children}</>;
};

export default ProtectedRoute;
