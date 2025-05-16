
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, Target, BarChart } from 'lucide-react';
import { ProfileWithPreferences } from '@/services/course-progress/types';
import { toast } from '@/components/ui/use-toast';

const CourseWelcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [completedAssessment, setCompletedAssessment] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoaded, setProfileLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      checkUserAssessment();
    } else {
      setLoading(false);
      setProfileLoaded(true);
    }
  }, [user]);

  const checkUserAssessment = async () => {
    try {
      setLoading(true);
      console.log("Verificando evaluación para usuario:", user?.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        console.error('Error al verificar el perfil:', error);
        setCompletedAssessment(false);
        setProfileLoaded(true);
        setLoading(false);
        return;
      }
      
      // Imprimir datos para depuración
      console.log("Datos del perfil:", profile);
      
      // Manejar el perfil con seguridad comprobando si los campos existen
      const userProfile = profile as ProfileWithPreferences;
      const hasCompletedAssessment = Boolean(userProfile?.completed_assessment);
      
      console.log("Estado de completed_assessment:", hasCompletedAssessment);
      setCompletedAssessment(hasCompletedAssessment);
      setProfileLoaded(true);
    } catch (error) {
      console.error('Error checking assessment status:', error);
      setCompletedAssessment(false);
      setProfileLoaded(true);
      toast({
        title: "Error",
        description: "No se pudo verificar el estado de la evaluación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = () => {
    navigate('/courses/onboarding');
  };

  // Mostrar pantalla de carga mientras se verifica el estado
  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  // Verificar en consola los valores que determinan la visualización del botón
  console.log("Estado final: Usuario:", !!user, "Perfil cargado:", profileLoaded, "Evaluación completada:", completedAssessment);

  const shouldShowButton = user && profileLoaded && !completedAssessment;
  console.log("¿Debería mostrar botón?", shouldShowButton);

  return (
    <Card className="mb-8 bg-gradient-to-r from-indigo-900/50 to-purple-900/30 border-indigo-700/50">
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Tu Viaje de Aprendizaje en Ciberseguridad
            </h2>
            
            <p className="text-gray-300 mb-6">
              Nuestra plataforma ofrece cursos estructurados que te guiarán paso a paso en tu 
              desarrollo profesional en ciberseguridad, desde conceptos básicos hasta técnicas avanzadas.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center">
                <div className="mr-3 p-2 bg-indigo-800/40 rounded-full">
                  <Target className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white">Rutas guiadas</div>
                  <div className="text-gray-400">Aprendizaje estructurado</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-3 p-2 bg-indigo-800/40 rounded-full">
                  <BarChart className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white">Seguimiento</div>
                  <div className="text-gray-400">Tu progreso en tiempo real</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-3 p-2 bg-indigo-800/40 rounded-full">
                  <Brain className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white">Personalizado</div>
                  <div className="text-gray-400">Adaptado a tu nivel</div>
                </div>
              </div>
            </div>
            
            {user ? (
              shouldShowButton ? (
                // Mostrar el botón solo si el usuario está autenticado y NO ha completado la evaluación
                <>
                  <Button onClick={handleStartAssessment} size="lg" variant="default">
                    Realizar evaluación inicial
                  </Button>
                  <p className="text-sm text-gray-400 mt-2">
                    Completa una breve evaluación para personalizar tu experiencia de aprendizaje.
                  </p>
                </>
              ) : (
                // Cuando el usuario ya completó la evaluación
                <p className="text-sm text-white mt-2 p-3 bg-indigo-800/40 rounded-md">
                  Ya has completado la evaluación inicial. Explora los cursos recomendados para ti.
                </p>
              )
            ) : (
              <div className="space-y-3">
                <Button onClick={() => navigate('/auth')} size="lg">
                  Inicia sesión para comenzar
                </Button>
                <p className="text-sm text-gray-400">
                  Registra una cuenta para guardar tu progreso y desbloquear todas las funciones
                </p>
              </div>
            )}
          </div>
          
          <div className="md:col-span-4 flex justify-center">
            <div className="p-1 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
              <img
                src="/courses/cybersecurity-learning.jpg"
                alt="Cybersecurity Learning"
                className="rounded-lg h-60 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop';
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseWelcome;
