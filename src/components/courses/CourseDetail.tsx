import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HybridCourseService } from './services/HybridCourseService';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

// Components
import CourseHeader from './components/CourseHeader';
import CourseImage from './components/CourseImage';
import CourseSections from './components/CourseSections';
import CourseProgressPanel from './components/CourseProgressPanel';
import CourseContent from './components/CourseContent';
import CourseDetailSkeleton from './components/CourseDetailSkeleton';

// Utilities & Services
import { findCourseById } from '@/data/courses';
import { validateCourseContent, debugCourseStructure } from '@/utils/course-content-validator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCourseProgress } from '@/hooks/use-course-progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [sectionsWithLessons, setSectionsWithLessons] = useState<any[]>([]);
  const [courseValidation, setCourseValidation] = useState<any | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const { progress, completedLessons } = useUserCourseProgress(courseId, user?.id);
  
  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!courseId) {
        console.error('CourseDetail: No courseId provided');
        toast({
          title: "Error",
          description: "No se pudo cargar el curso",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`CourseDetail: Buscando curso con ID: ${courseId}`);
      setLoading(true);

      try {
        // Primer intento: buscar en datos estáticos
        const staticCourse = findCourseById(courseId);
        
        if (staticCourse) {
          console.log('CourseDetail: Curso encontrado en datos estáticos:', staticCourse);
          
          // Procesamos secciones y lecciones del curso estático
          const sectionsData = staticCourse.modules.map(module => ({
            id: module.id,
            title: module.title,
            course_id: courseId,
            position: module.position || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            lessons: module.lessons.map((lesson, index) => ({
              id: lesson.id,
              title: lesson.title,
              content: '',
              duration_minutes: lesson.duration_minutes,
              section_id: module.id,
              position: index,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              video_url: null
            }))
          }));
          
          console.log('CourseDetail: Secciones con lecciones de datos estáticos:', sectionsData);
          
          setCourse({
            id: staticCourse.id,
            title: staticCourse.title,
            description: staticCourse.description,
            image_url: staticCourse.image_url || `/courses/${staticCourse.id}/cover.jpg`,
            category: staticCourse.category,
            level: staticCourse.level,
            instructor: staticCourse.instructor,
            duration_minutes: staticCourse.duration_minutes
          });
          
          setSectionsWithLessons(sectionsData);
          document.title = `${staticCourse.title} - VulnZero`;

        } else {
          // Segundo intento: buscar usando el servicio híbrido
          console.log('CourseDetail: No se encontró en datos estáticos, buscando con servicio híbrido');
          const dynamicCourse = await HybridCourseService.getCourseById(courseId);
          
          if (!dynamicCourse) {
            console.error(`CourseDetail: No se encontró el curso con ID: ${courseId}`);
            toast({
              title: "Curso no encontrado",
              description: "El curso solicitado no existe",
              variant: "destructive"
            });
            navigate('/courses');
            return;
          }
          
          setCourse(dynamicCourse);
          document.title = `${dynamicCourse.title} - VulnZero`;
          
          // Cargamos secciones del curso
          const sections = await HybridCourseService.getCourseSections(courseId);
          
          // Para cada sección, cargamos sus lecciones
          const sectionsWithLessonsPromises = sections.map(async section => {
            const lessons = await HybridCourseService.getSectionLessons(section.id);
            return {
              ...section,
              lessons
            };
          });
          
          const resolvedSectionsWithLessons = await Promise.all(sectionsWithLessonsPromises);
          setSectionsWithLessons(resolvedSectionsWithLessons);
        }
      } catch (error) {
        console.error('Error loading course details:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el detalle del curso",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCourseDetails();
  }, [courseId, navigate]);
  
  // Función para iniciar curso (navegar a la primera lección)
  const startCourse = () => {
    if (sectionsWithLessons.length > 0 && sectionsWithLessons[0].lessons.length > 0) {
      const firstSection = sectionsWithLessons[0];
      const firstLesson = firstSection.lessons[0];
      
      console.log(`Navigating to first lesson: /courses/${courseId}/learn/${firstSection.id}/${firstLesson.id}`);
      navigate(`/courses/${courseId}/learn/${firstSection.id}/${firstLesson.id}`);
    }
  };
  
  // Validación del contenido del curso
  const validateContent = async () => {
    if (!courseId) return;
    
    setValidationLoading(true);
    try {
      const result = await validateCourseContent(courseId);
      setCourseValidation(result);
      
      // Debug information
      debugCourseStructure(courseId);
      
    } catch (error) {
      console.error('Error validating course content:', error);
    } finally {
      setValidationLoading(false);
    }
  };

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se pudo encontrar el curso solicitado.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Calcular el número total de lecciones
  const totalLessons = sectionsWithLessons.reduce((total, section) => 
    total + (section.lessons ? section.lessons.length : 0), 0);

  // Calcular horas y minutos para mostrar en el panel de progreso
  const durationHours = Math.floor(course.duration_minutes / 60);
  const durationMinutes = course.duration_minutes % 60;

  // Calcular el número de lecciones completadas
  const completedLessonsCount = completedLessons ? Object.keys(completedLessons).length : 0;

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Pasamos el objeto course completo a CourseHeader */}
      <CourseHeader 
        course={course}
        totalLessons={totalLessons}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          <CourseImage src={course.image_url} alt={course.title} />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-gray-400 mt-1">{course.description}</p>
            </div>
            
            <Button 
              size="lg"
              onClick={startCourse} 
              className="flex items-center whitespace-nowrap"
            >
              Comenzar Curso
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {courseValidation && !courseValidation.valid && 'missingLessons' in courseValidation && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Advertencia: Contenido Incompleto</AlertTitle>
              <AlertDescription>
                <p>Algunos archivos de lecciones no fueron encontrados ({courseValidation.missingLessons.length} lecciones faltantes).</p>
                <p className="mt-2">Esto puede causar errores al intentar acceder a ciertas lecciones.</p>
              </AlertDescription>
            </Alert>
          )}
          
          <Separator className="my-6" />
          
          {/* Contenido del curso - Ahora pasamos correctamente las props */}
          <CourseContent 
            sections={sectionsWithLessons}
            courseId={courseId || ''}
            courseDescription={course.description || ''}
            completedLessons={completedLessons || {}}
          />
          
          <Separator className="my-6" />
          
          {/* Secciones del curso */}
          {sectionsWithLessons.length > 0 && (
            <CourseSections 
              sections={sectionsWithLessons} 
              courseId={courseId || ''} 
              completedLessons={completedLessons}
            />
          )}
        </div>
        
        {/* Barra lateral */}
        <div className="lg:col-span-1">
          <CourseProgressPanel 
            progress={progress}
            completedLessonsCount={completedLessonsCount}
            totalLessons={totalLessons}
            durationHours={durationHours}
            durationMinutes={durationMinutes}
            onContinue={startCourse}
            onStart={startCourse}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
