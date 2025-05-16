
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FileLessonDetail from '@/components/courses/FileLessonDetail';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';

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
    // Scroll al inicio para evitar posiciones intermedias
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`pt-16 pb-8 ${user ? 'md:pl-64' : ''}`}>
        {courseId && moduleId && lessonId && (
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
