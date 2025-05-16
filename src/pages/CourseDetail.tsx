
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';
import { toast } from '@/components/ui/use-toast';
import { findCourseById } from '@/data/courses';
import FileCourseDetail from '@/components/courses/FileCourseDetail';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (courseId) {
      const course = findCourseById(courseId);
      if (!course) {
        toast({
          title: "Curso no encontrado",
          description: "El curso que buscas no existe. Verifica la URL o contacta con soporte.",
          variant: "destructive",
        });
        navigate('/courses');
        return;
      }
      
      document.title = `${course.title} - VulnZero`;
      setLoading(false);
    }
    
    // Siempre scroll al inicio para evitar posiciones intermedias
    window.scrollTo(0, 0);
  }, [courseId, navigate]);

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`pt-16 pb-8 ${user ? 'md:pl-64' : ''}`}>
        {!loading && courseId && <FileCourseDetail courseId={courseId} />}
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
