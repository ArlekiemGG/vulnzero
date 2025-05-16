
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CourseService, Course } from './services/CourseService';
import CourseCard from './CourseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const CourseWelcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      setLoading(true);
      try {
        // En una implementación real, esta función podría usar algoritmos de recomendación
        // basados en el historial del usuario, su nivel, etc.
        // Por ahora, simplemente obtenemos algunos cursos aleatorios
        const allCourses = await CourseService.getCourses();
        
        // Seleccionar hasta 2 cursos para recomendar
        let recommended: Course[] = [];
        if (allCourses.length > 0) {
          // Mezclar aleatoriamente los cursos para simular recomendaciones
          const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
          recommended = shuffled.slice(0, Math.min(2, allCourses.length));
        }
        
        setRecommendedCourses(recommended);
      } catch (error) {
        console.error("Error fetching recommended courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedCourses();
  }, []);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'buenos días';
    if (hour < 18) return 'buenas tardes';
    return 'buenas noches';
  };

  return (
    <div className="mb-12">
      <div className="bg-gradient-to-r from-cybersec-darkgray to-cybersec-black p-8 rounded-lg border border-cybersec-darkgray shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {user ? `Hola ${user.user_metadata?.username || 'Hacker'}, ${getTimeOfDay()}` : '¡Bienvenido a los cursos de VulnZero!'}
        </h2>
        
        <p className="text-gray-400 mb-6">
          {user 
            ? 'Continúa tu aprendizaje con nuestros cursos estructurados de ciberseguridad.' 
            : 'Aprende ciberseguridad a tu ritmo con nuestros cursos estructurados.'}
        </p>
        
        {!user && (
          <Button onClick={() => navigate('/auth')} className="bg-cybersec-neongreen hover:bg-cybersec-neongreen/90 text-black">
            Registrarse para guardar progreso
          </Button>
        )}
      </div>

      {user && recommendedCourses.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Recomendados para ti</h3>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((_, index) => (
                <div key={index} className="flex flex-col h-[350px] rounded-lg overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4 space-y-2 flex-grow">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between pt-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-2 w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseWelcome;
