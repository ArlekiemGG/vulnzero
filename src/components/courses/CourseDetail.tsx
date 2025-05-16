
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { courseProgressService } from '@/services/course-progress-service'; 
import { HybridCourseService } from './services/HybridCourseService';
import { SectionWithLessons } from './types';
import { findCourseById } from '@/data/courses';

// Componentes refactorizados
import CourseHeader from './components/CourseHeader';
import CourseImage from './components/CourseImage';
import CourseContent from './components/CourseContent';
import CourseProgressPanel from './components/CourseProgressPanel';
import CourseDetailSkeleton from './components/CourseDetailSkeleton';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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
      console.log("CourseDetail: Buscando curso con ID:", courseId);
      
      // Primero intentamos encontrar el curso desde los datos estáticos
      const staticCourse = findCourseById(courseId);
      
      if (staticCourse) {
        console.log("CourseDetail: Curso encontrado en datos estáticos:", staticCourse);
        setCourse(staticCourse);
        
        // Si tenemos secciones y lecciones en el curso estático
        if (staticCourse.modules && staticCourse.modules.length > 0) {
          const sectionsWithLessons = staticCourse.modules.map(module => ({
            id: module.id,
            title: module.title,
            course_id: courseId,
            position: module.position || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            lessons: module.lessons.map(lesson => ({
              id: lesson.id,
              title: lesson.title,
              content: '',
              duration_minutes: lesson.duration_minutes || 0,
              section_id: module.id,
              position: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              video_url: null
            }))
          }));
          
          console.log("CourseDetail: Secciones con lecciones de datos estáticos:", sectionsWithLessons);
          setSections(sectionsWithLessons);
        } else {
          // Si no hay módulos, intentar cargar las secciones desde el servicio híbrido
          await loadCourseSections(courseId);
        }
      } else {
        // Si no se encuentra en datos estáticos, intentar con el servicio híbrido
        console.log("CourseDetail: Curso no encontrado en datos estáticos, buscando en servicio híbrido");
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

        // Obtener las secciones del curso y sus lecciones
        await loadCourseSections(courseData.id);
      }
      
      // Obtener el progreso del curso si el usuario está autenticado
      if (user) {
        await loadUserProgress(courseId);
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
  }, [courseId, user, navigate]);

  // Extraemos la carga de secciones a una función separada
  const loadCourseSections = async (courseId: string) => {
    try {
      const sectionsData = await HybridCourseService.getCourseSections(courseId);
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
    } catch (error) {
      console.error("Error loading course sections:", error);
      throw error; // Propagar el error para manejarlo en la función principal
    }
  };

  // Extraemos la carga de progreso a una función separada
  const loadUserProgress = async (courseId: string) => {
    if (!user) return;
    
    try {
      // Usamos el nuevo servicio unificado
      const { data: progressData } = await courseProgressService.getCourseProgress(user.id, courseId);
      if (progressData) {
        setProgress(progressData.progress_percentage || 0);
      }
      
      // Obtener el estado de las lecciones completadas usando el nuevo servicio
      const result = await courseProgressService.fetchUserProgressData(courseId, user.id);
      setCompletedLessons(result.completedLessons);
    } catch (error) {
      console.error("Error loading user progress:", error);
      // No lanzamos el error, simplemente continuamos con los valores predeterminados
    }
  };

  // Manejar la carga inicial de datos
  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Contadores y funciones de navegación
  const getTotalLessons = () => {
    return sections.reduce((total, section) => total + section.lessons.length, 0);
  };
  
  const getCompletedLessonsCount = () => {
    return Object.values(completedLessons).filter(Boolean).length;
  };

  const startCourse = () => {
    if (sections.length > 0 && sections[0].lessons.length > 0) {
      console.log(`Navigating to first lesson: /courses/${courseId}/learn/${sections[0].id}/${sections[0].lessons[0].id}`);
      navigate(`/courses/${courseId}/learn/${sections[0].id}/${sections[0].lessons[0].id}`);
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
        if (!completedLessons[lesson.id] && 
            !completedLessons[`${courseId}:${lesson.id}`]) {
          console.log(`Continuing course at: /courses/${courseId}/learn/${section.id}/${lesson.id}`);
          navigate(`/courses/${courseId}/learn/${section.id}/${lesson.id}`);
          return;
        }
      }
    }
    
    // Si todas están completadas, ir a la primera lección
    if (sections.length > 0 && sections[0].lessons.length > 0) {
      navigate(`/courses/${courseId}/learn/${sections[0].id}/${sections[0].lessons[0].id}`);
    }
  };

  // Renderizamos el estado de carga
  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  // Si no hay datos de curso, mostramos un mensaje
  if (!course) {
    return <div className="container px-4 py-8 mx-auto">Curso no encontrado</div>;
  }

  // Renderizado principal
  return (
    <div 
      ref={contentRef} 
      className={`container px-4 py-8 mx-auto transition-opacity duration-700 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Contenido principal */}
        <div className="w-full md:w-2/3">
          <CourseHeader course={course} totalLessons={getTotalLessons()} />
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
            completedLessonsCount={getCompletedLessonsCount()}
            totalLessons={getTotalLessons()}
            durationHours={Math.floor(course.duration_minutes / 60)}
            durationMinutes={course.duration_minutes % 60}
            onContinue={continueCourse}
            onStart={startCourse}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
