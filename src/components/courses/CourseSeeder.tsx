
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CourseService } from '@/services/CourseService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const CourseSeeder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCreateCourses = async () => {
    setLoading(true);
    try {
      const result = await CourseService.ensureCoursesExist();
      
      if (result) {
        toast({
          title: "Éxito",
          description: "Cursos creados correctamente. La página se recargará para mostrarlos.",
          variant: "success",
        });
        
        // Reload the page after short delay to show the new courses
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "Información",
          description: "Ya existen cursos en la base de datos o no se pudo completar la operación.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error creating courses:", error);
      toast({
        title: "Error",
        description: "No se pudieron crear los cursos. Verifica la consola para más detalles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Only show to logged in users
  if (!user) return null;

  return (
    <div className="mb-6">
      <Button
        variant="outline"
        className="bg-cybersec-darkgray hover:bg-cybersec-darkgray/80 border-cybersec-electricblue text-cybersec-electricblue"
        onClick={handleCreateCourses}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creando cursos...
          </>
        ) : (
          'Crear cursos de prueba'
        )}
      </Button>
    </div>
  );
};

export default CourseSeeder;
