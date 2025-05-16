
import { useEffect, useState, useCallback } from 'react';
import { SearchIcon } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';
import CourseTabs from '@/components/courses/CourseTabs';
import CourseWelcome from '@/components/courses/CourseWelcome';

const Courses: React.FC = () => {
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    document.title = "Cursos - VulnZero";
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cybersec-black">
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`flex-grow pt-16 ${user ? 'md:pl-64' : ''}`}>
        <div className="container px-4 py-8 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Cursos de Ciberseguridad</h1>
              <p className="text-gray-400 mt-2">
                Aprende a tu ritmo con nuestros cursos estructurados
              </p>
            </div>
            
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                type="text"
                placeholder="Buscar cursos..."
                className="w-full py-2 pl-10 pr-4 rounded-md border border-cybersec-darkgray bg-cybersec-black text-white focus:outline-none focus:ring-2 focus:ring-cybersec-neongreen focus:border-transparent"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <CourseWelcome />
          <CourseTabs />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
