
import CourseTabs from '@/components/courses/CourseTabs';
import { SearchIcon, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Courses: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
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
    
    if (user) {
      checkAdmin();
    }
  }, [user]);

  return (
    <div className="container px-4 py-8 mx-auto">
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

      <CourseTabs />
    </div>
  );
};

export default Courses;
