
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';
import FileLessonDetail from '@/components/courses/FileLessonDetail';

const LessonPage = () => {
  const { courseId, moduleId, lessonId } = useParams<{ 
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>();
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId, moduleId, lessonId]);

  // Safety check - if any of the required params are missing, we can't render the lesson
  if (!courseId || !moduleId || !lessonId) {
    return (
      <div className={`page-wrapper ${user ? 'has-sidebar' : ''}`}>
        <Navbar />
        {user && <Sidebar userStats={userStats} />}
        <main className={`content-area ${user ? 'md:pl-64' : ''} pt-16 pb-8`}>
          <div className="container px-4 py-8 mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Parámetros faltantes</h1>
            <p>No se pueden cargar los detalles de la lección porque faltan parámetros necesarios.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className={`page-wrapper ${user ? 'has-sidebar' : ''}`}>
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`content-area ${user ? 'md:pl-64' : ''} pt-16 pb-8`}>
        <FileLessonDetail 
          courseId={courseId} 
          moduleId={moduleId} 
          lessonId={lessonId} 
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default LessonPage;
