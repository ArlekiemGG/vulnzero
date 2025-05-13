
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CourseService } from '@/services/CourseService';

const CourseSeeder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Only show for admins (based on role in profile)
  const [isAdmin, setIsAdmin] = useState(false);
  
  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data } = await fetch(`/api/check-admin?userId=${user.id}`).then(res => res.json());
        setIsAdmin(data?.isAdmin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  // If no user or not admin, hide
  if (!isAdmin) return null;
  
  const handleSeedCourses = async () => {
    setLoading(true);
    try {
      const success = await CourseService.ensureCoursesExist();
      toast({
        title: success ? "Éxito" : "Información",
        description: success 
          ? "Cursos creados correctamente" 
          : "Los cursos ya existen en la base de datos",
        variant: success ? "default" : "secondary",
      });
    } catch (error) {
      console.error('Error seeding courses:', error);
      toast({
        title: "Error",
        description: "No se pudieron crear los cursos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mb-4">
      <Button 
        onClick={handleSeedCourses} 
        variant="outline" 
        className="border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue hover:text-white"
        disabled={loading}
      >
        {loading ? 'Creando cursos...' : 'Crear cursos de prueba'}
      </Button>
    </div>
  );
};

export default CourseSeeder;
