
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
          ) : (
            <FileLessonDetail 
              courseId={courseId} 
              moduleId={moduleId} 
              lessonId={lessonId} 
            />
          )}
        </ErrorBoundary>
      </main>
      
      <Footer />
    </div>
  );
};

export default LessonDetail;
