
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FileLessonDetail from '@/components/courses/FileLessonDetail';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const LessonDetail = () => {
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  const { courseId, moduleId, lessonId } = useParams<{ 
    courseId: string; 
    moduleId: string;
    lessonId: string;
  }>();
  
  useEffect(() => {
    document.title = "Lección - VulnZero";
    // Scroll to top to avoid intermediate positions
    window.scrollTo(0, 0);
  }, []);

  const missingParams = !courseId || !moduleId || !lessonId;

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`pt-16 pb-8 ${user ? 'md:pl-64' : ''}`}>
        {missingParams ? (
          <div className="container mx-auto px-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
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
      </main>
      
      <Footer />
    </div>
  );
};

export default LessonDetail;
