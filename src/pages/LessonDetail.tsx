
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileLessonDetail from '@/components/courses/FileLessonDetail';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { toast } from '@/components/ui/use-toast';
import { validateLessonContent } from '@/utils/course-content-validator';

const LessonDetail = () => {
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  const navigate = useNavigate();
  const { courseId, moduleId, lessonId } = useParams<{ 
    courseId: string; 
    moduleId: string;
    lessonId: string;
  }>();
  
  const [validRoute, setValidRoute] = useState(true);
  const [contentExists, setContentExists] = useState<boolean | null>(null);
  const [isCheckingContent, setIsCheckingContent] = useState<boolean>(false);
  
  // Validate route parameters
  useEffect(() => {
    document.title = `Lección - VulnZero`;
    // Scroll to top to avoid intermediate positions
    window.scrollTo(0, 0);
    
    // Check for valid route parameters
    if (!courseId || !moduleId || !lessonId) {
      setValidRoute(false);
      
      // Show a toast notification for better user experience
      toast({
        title: "Ruta inválida",
        description: "Parámetros de la lección incompletos",
        variant: "destructive",
      });
    } else {
      setValidRoute(true);
      
      // Log the route for debugging purposes
      console.log(`Accediendo a lección - Curso: ${courseId}, Módulo: ${moduleId}, Lección: ${lessonId}`);
    }
  }, [courseId, moduleId, lessonId]);

  // Verify if content file exists
  useEffect(() => {
    const checkContentExists = async () => {
      if (!courseId || !moduleId || !lessonId) return;
      
      setIsCheckingContent(true);
      try {
        const exists = await validateLessonContent(courseId, moduleId, lessonId);
        setContentExists(exists);
        
        if (!exists) {
          console.warn(`El archivo de contenido no existe para la lección: ${courseId}/${moduleId}/${lessonId}`);
        }
      } catch (error) {
        console.error('Error verificando existencia de contenido:', error);
        setContentExists(false);
      } finally {
        setIsCheckingContent(false);
      }
    };
    
    if (validRoute) {
      checkContentExists();
    }
  }, [courseId, moduleId, lessonId, validRoute]);

  const missingParams = !courseId || !moduleId || !lessonId;

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`pt-16 pb-8 ${user ? 'md:pl-64' : ''}`}>
        <ErrorBoundary>
          {missingParams ? (
            <div className="container mx-auto px-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  No se pudieron cargar los detalles de la lección. Parámetros incompletos.
                </AlertDescription>
              </Alert>
            </div>
          ) : isCheckingContent ? (
            <div className="container mx-auto px-4 flex justify-center">
              <div className="animate-pulse text-center">
                <p className="text-gray-400">Verificando disponibilidad del contenido...</p>
              </div>
            </div>
          ) : contentExists === false ? (
            <div className="container mx-auto px-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de contenido</AlertTitle>
                <AlertDescription>
                  No se encontró el archivo de contenido para esta lección. 
                  Ruta esperada: <code className="bg-gray-800 px-1 py-0.5 rounded text-xs">/courses/{courseId}/{moduleId}/{lessonId}.html</code>
                </AlertDescription>
              </Alert>
              <div className="mt-4 text-center">
                <p className="text-gray-400 mb-2">Esta lección podría estar en desarrollo o no estar disponible todavía.</p>
                <button 
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="text-blue-500 hover:underline"
                >
                  Volver al curso
                </button>
              </div>
            </div>
          ) : (
            <FileLessonDetail 
              courseId={courseId!} 
              moduleId={moduleId!} 
              lessonId={lessonId!} 
            />
          )}
        </ErrorBoundary>
      </main>
      
      <Footer />
    </div>
  );
};

export default LessonDetail;
