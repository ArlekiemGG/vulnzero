
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import CourseDetailsComponent from '@/components/courses/CourseDetails';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Course, CourseSection, CourseService } from '@/services/CourseService';

const CourseDetailsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [lessonCount, setLessonCount] = useState(0);
  const [userStats, setUserStats] = useState({
    level: 1,
    points: 0,
    pointsToNextLevel: 0,
    progress: 0,
    rank: 0,
    solvedMachines: 0,
    completedChallenges: 0,
  });
  
  // Cargar datos del curso y progreso del usuario
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        // Obtener detalles del curso
        const courseData = await CourseService.getCourseById(courseId);
        setCourse(courseData);
        
        // Obtener secciones del curso
        const sectionsData = await CourseService.getCourseSections(courseId);
        setSections(sectionsData);
        
        // Contar lecciones totales
        let totalLessons = 0;
        for (const section of sectionsData) {
          const lessons = await CourseService.getSectionLessons(section.id);
          totalLessons += lessons.length;
        }
        setLessonCount(totalLessons);
        
        // Si el usuario está autenticado, obtener su progreso
        if (user) {
          const progress = await CourseService.getCourseProgress(user.id, courseId);
          setUserProgress(progress);
        }
      } catch (error) {
        console.error("Error cargando el curso:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del curso",
          variant: "destructive",
        });
        navigate("/tutorials");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, user, toast, navigate]);
  
  // Iniciar el curso
  const handleStartCourse = async () => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para seguir el progreso del curso",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!course) return;
    
    try {
      // Buscar la primera sección
      if (sections.length > 0) {
        // Buscar la primera lección de la primera sección
        const firstSectionLessons = await CourseService.getSectionLessons(sections[0].id);
        if (firstSectionLessons.length > 0) {
          // Iniciar o actualizar el progreso del usuario
          await CourseService.updateCourseProgress(user.id, courseId, firstSectionLessons[0].id, 0);
          
          // Navegar a la primera lección
          navigate(`/tutorials/${courseId}/lesson/${firstSectionLessons[0].id}`);
        }
      }
    } catch (error) {
      console.error("Error iniciando el curso:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el curso",
        variant: "destructive",
      });
    }
  };
  
  // Continuar el curso
  const handleResumeCourse = async () => {
    if (!user || !userProgress || !userProgress.last_lesson_id) {
      handleStartCourse();
      return;
    }
    
    // Navegar a la última lección vista
    navigate(`/tutorials/${courseId}/lesson/${userProgress.last_lesson_id}`);
  };
  
  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Navegación */}
            <div className="mb-6">
              <Button 
                variant="outline" 
                className="border-cybersec-electricblue text-cybersec-electricblue"
                onClick={() => navigate('/tutorials')}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Volver a Tutoriales
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                <div className="h-64 bg-cybersec-darkgray rounded-lg animate-pulse"></div>
                <div className="h-8 w-1/2 bg-cybersec-darkgray rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-cybersec-darkgray rounded animate-pulse"></div>
                <div className="h-4 w-2/3 bg-cybersec-darkgray rounded animate-pulse"></div>
              </div>
            ) : course ? (
              <CourseDetailsComponent 
                course={course}
                lessonCount={lessonCount}
                userProgress={userProgress}
                onStartCourse={handleStartCourse}
                onResumeCourse={handleResumeCourse}
              />
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400">El curso solicitado no existe o no está disponible.</p>
                <Button 
                  variant="link" 
                  className="text-cybersec-electricblue mt-4"
                  onClick={() => navigate('/tutorials')}
                >
                  Volver a Tutoriales
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
