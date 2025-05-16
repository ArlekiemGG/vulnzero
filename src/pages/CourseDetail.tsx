
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CourseDetailComponent from '@/components/courses/CourseDetail';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';

const CourseDetail = () => {
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  const location = useLocation();
  
  useEffect(() => {
    document.title = "Detalle del curso - VulnZero";
    
    // Siempre scroll al inicio para evitar posiciones intermedias
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`pt-16 pb-8 ${user ? 'md:pl-64' : ''}`}>
        <CourseDetailComponent />
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
