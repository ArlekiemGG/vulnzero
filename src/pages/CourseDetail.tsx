
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';
import { findCourseById } from '@/data/courses';
import CourseDetail from '@/components/courses/CourseDetail';

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (courseId) {
      console.log("CourseDetailPage: Verificando curso con ID:", courseId);
      const course = findCourseById(courseId);
      
      if (!course) {
        console.warn("CourseDetailPage: Curso no encontrado con ID:", courseId);
        // No navegamos aquí, dejamos que el componente CourseDetail maneje este caso
        // ya que él verificará también con el servicio híbrido
      } else {
        console.log("CourseDetailPage: Curso encontrado:", course.title);
        document.title = `${course.title} - VulnZero`;
      }
      
      setLoading(false);
    }
    
    // Siempre scroll al inicio para evitar posiciones intermedias
    window.scrollTo(0, 0);
  }, [courseId, navigate]);

  // Debug para verificar el courseId recibido
  console.log("CourseDetailPage: courseId recibido:", courseId);

  return (
    <div className="page-wrapper">
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`content-area ${user ? 'md:pl-64' : ''} pt-16`}>
        <div className="container px-4 py-8 mx-auto">
          {!loading && courseId && <CourseDetail />}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetailPage;
