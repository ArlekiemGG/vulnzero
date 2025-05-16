import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HybridCourseService } from './services/HybridCourseService';
import { useProgressService } from './services/ProgressService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { SectionWithLessons } from './types';

// Componentes refactorizados
import CourseHeader from './components/CourseHeader';
import CourseImage from './components/CourseImage';
import CourseContent from './components/CourseContent';
import CourseProgressPanel from './components/CourseProgressPanel';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCourseProgress } = useProgressService();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState<SectionWithLessons[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fadeIn, setFadeIn] = useState<boolean>(false);

  // Controlamos la animación de entrada solo después de que los datos estén listos
  useEffect(() => {
    if (!isLoading) {
      // Pequeño retraso para dar tiempo a que el DOM se actualice
      const timer = setTimeout(() => setFadeIn(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Scroll to top when navigating to this page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) {
      console.error("Error: No se especificó un ID de curso");
      toast({
        title: "Error",
        description: "No se especificó un ID de curso",
        variant: "destructive",
      });
      navigate('/courses');
      return;
    }
    
    setIsLoading(true);
    setFadeIn(false); // Aseguramos inicio con fade out
    
    try {
      console.log("CourseDetail: Fetching course with ID:", courseId);
      
      // Obtener datos del curso usando el servicio híbrido
      const courseData = await HybridCourseService.getCourseById(courseId);
      
      if (!courseData) {
        console.error("CourseDetail: Curso no encontrado con ID:", courseId);
        toast({
          title: "Curso no encontrado",
          description: "El curso que buscas no existe. Por favor, verifica la URL o contacta con soporte.",
          variant: "destructive",
        });
        navigate('/courses');
        return;
      }
      
      console.log("CourseDetail: Course data loaded:", courseData);
      setCourse(courseData);

      // Obtener las secciones del curso
      const sectionsData = await HybridCourseService.getCourseSections(courseData.id);
      console.log("CourseDetail: Sections loaded:", sectionsData.length);
      
      // Obtener las lecciones de cada sección
      const sectionsWithLessons: SectionWithLessons[] = await Promise.all(
        sectionsData.map(async (section) => {
          const lessons = await HybridCourseService.getSectionLessons(section.id);
          return {
            ...section,
            lessons
          };
        })
      );
      
      console.log("CourseDetail: Sections with lessons:", sectionsWithLessons);
      setSections(sectionsWithLessons);
      
      // Obtener el progreso del curso si el usuario está autenticado
      if (user) {
        const progressData = await getCourseProgress(courseData.id);
        if (progressData) {
          setProgress(progressData.progress_percentage);
        }
        
        // Obtener el estado de las lecciones completadas
        const fetchCompletedLessons = async () => {
          const { data } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id)
            .eq('completed', true);
          
          if (data) {
            const completedMap: Record<string, boolean> = {};
            data.forEach(item => {
              completedMap[item.lesson_id] = item.completed;
            });
            setCompletedLessons(completedMap);
          }
        };
        
        fetchCompletedLessons();
      }
    } catch (error) {
      console.error('CourseDetail: Error fetching course data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del curso. Por favor, inténtalo más tarde.",
        variant: "destructive",
      });
      navigate('/courses');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, user, navigate, getCourseProgress]);

  // Manejar la carga inicial de datos
  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const getTotalLessons = () => {
    return sections.reduce((total, section) => total + section.lessons.length, 0);
  };
  
  const getCompletedLessonsCount = () => {
    return Object.values(completedLessons).filter(Boolean).length;
  };

  const startCourse = () => {
    if (sections.length > 0 && sections[0].lessons.length > 0) {
      navigate(`/courses/${courseId}/lessons/${sections[0].lessons[0].id}`);
    } else {
      toast({
        title: "Sin lecciones",
        description: "Este curso aún no tiene lecciones disponibles",
        variant: "destructive",
      });
    }
  };

  const continueCourse = () => {
    // Buscar la última lección completada o la primera no completada
    for (const section of sections) {
      for (const lesson of section.lessons) {
        if (!completedLessons[lesson.id]) {
          navigate(`/courses/${courseId}/lessons/${lesson.id}`);
          return;
        }
      }
    }
    
    // Si todas están completadas, ir a la primera lección
    if (sections.length > 0 && sections[0].lessons.length > 0) {
      navigate(`/courses/${courseId}/lessons/${sections[0].lessons[0].id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-40 w-full mb-8" />
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="container px-4 py-8 mx-auto">Curso no encontrado</div>;
  }

  return (
    <div 
      ref={contentRef} 
      className={`container px-4 py-8 mx-auto transition-opacity duration-700 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Contenido principal */}
        <div className="w-full md:w-2/3">
          <CourseHeader course={course} totalLessons={sections.reduce((total, section) => total + section.lessons.length, 0)} />
          <CourseImage imageUrl={course.image_url} title={course.title} />
          <CourseContent 
            sections={sections} 
            courseId={courseId} 
            courseDescription={course.description}
            completedLessons={completedLessons}
          />
        </div>
        
        {/* Panel lateral */}
        <div className="w-full md:w-1/3">
          <CourseProgressPanel 
            progress={progress}
            completedLessonsCount={Object.values(completedLessons).filter(Boolean).length}
            totalLessons={sections.reduce((total, section) => total + section.lessons.length, 0)}
            durationHours={Math.floor(course.duration_minutes / 60)}
            durationMinutes={course.duration_minutes % 60}
            onContinue={() => {
              // Buscar la última lección completada o la primera no completada
              for (const section of sections) {
                for (const lesson of section.lessons) {
                  if (!completedLessons[lesson.id]) {
                    navigate(`/courses/${courseId}/lessons/${lesson.id}`);
                    return;
                  }
                }
              }
              
              // Si todas están completadas, ir a la primera lección
              if (sections.length > 0 && sections[0].lessons.length > 0) {
                navigate(`/courses/${courseId}/lessons/${sections[0].lessons[0].id}`);
              }
            }}
            onStart={() => {
              if (sections.length > 0 && sections[0].lessons.length > 0) {
                navigate(`/courses/${courseId}/lessons/${sections[0].lessons[0].id}`);
              } else {
                toast({
                  title: "Sin lecciones",
                  description: "Este curso aún no tiene lecciones disponibles",
                  variant: "destructive",
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
