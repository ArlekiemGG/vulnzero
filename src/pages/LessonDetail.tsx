
import LessonDetailComponent from '@/components/courses/LessonDetail';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';

const LessonDetail = () => {
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  
  useEffect(() => {
    document.title = "Lección - VulnZero";
  }, []);

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`pt-16 pb-8 ${user ? 'md:pl-64' : ''}`}>
        <LessonDetailComponent />
      </main>
      
      <Footer />
    </div>
  );
};

export default LessonDetail;
