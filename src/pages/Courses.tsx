
import { useEffect, useState } from 'react';
import CourseTabs from '@/components/courses/CourseTabs';
import { SearchIcon, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from '@/components/layout/Sidebar';

const Courses: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStats, setUserStats] = useState({
    level: 1,
    points: 0,
    pointsToNextLevel: 100,
    progress: 0,
    rank: 0,
    solvedMachines: 0,
    completedChallenges: 0,
  });
  
  useEffect(() => {
    document.title = "Cursos - VulnZero";
    
    // Check if user is admin
    const checkAdmin = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    // Fetch user stats
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        // Get basic profile data
        const { data } = await supabase
          .from('profiles')
          .select('level, points, rank')
          .eq('id', user.id)
          .single();
          
        if (data) {
          // Calculate points needed for next level (simplified formula)
          const pointsToNextLevel = data.level * 100;
          const progress = Math.min(Math.floor((data.points / pointsToNextLevel) * 100), 100);
          
          // Get solved machines count
          const { count: solvedMachines } = await supabase
            .from('user_machine_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('completed', true);
            
          // Check if we have completed challenges count - using a safer approach
          let completedChallenges = 0;
          // We'll use profiles.completed_challenges instead of querying user_challenges table
          
          setUserStats({
            level: data.level || 1,
            points: data.points || 0,
            pointsToNextLevel,
            progress,
            rank: data.rank || 0,
            solvedMachines: solvedMachines || 0,
            completedChallenges: data.completed_challenges || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };
    
    if (user) {
      checkAdmin();
      fetchUserStats();
    }
  }, [user]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userStats={userStats} />
      
      <main className="flex-1 pt-16 px-4 md:px-8 md:ml-64">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Cursos de Ciberseguridad</h1>
              <p className="text-gray-500 mt-2">
                Aprende a tu ritmo con nuestros cursos estructurados
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-500" />
                </div>
                <input 
                  type="text"
                  placeholder="Buscar cursos..."
                  className="w-full py-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              {isAdmin && (
                <Button asChild variant="default">
                  <Link to="/courses/create" className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Nuevo Curso</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <CourseTabs />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Courses;
