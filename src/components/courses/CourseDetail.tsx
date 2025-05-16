
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CourseService, Course, Section, Lesson } from './services/CourseService';
import { useProgressService } from './services/ProgressService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, Clock, Award, ChevronRight, Play, CheckCircle, CircleDot, Circle, BarChart 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface SectionWithLessons extends Section {
  lessons: Lesson[];
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getCourseProgress } = useProgressService();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<SectionWithLessons[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fadeIn, setFadeIn] = useState<boolean>(false);

  // Controlamos la animación de entrada solo después de que los datos estén listos
  useEffect(() => {
    if (!isLoading) {
      // Pequeño retraso para dar tiempo a que el DOM se actualice
      const timer = setTimeout(() => setFadeIn(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Limpiamos el efecto de animación al desmontar
  useEffect(() => {
    return () => setFadeIn(false);
  }, []);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      setIsLoading(true);
      setFadeIn(false); // Aseguramos inicio con fade out
      
      try {
        // Obtener datos del curso
        const courseData = await CourseService.getCourseById(courseId);
        if (!courseData) {
          toast({
            title: "Curso no encontrado",
            description: "El curso que buscas no existe",
            variant: "destructive",
          });
          navigate('/courses');
          return;
        }
        setCourse(courseData);

        // Obtener las secciones del curso
        const sectionsData = await CourseService.getCourseSections(courseId);
        
        // Obtener las lecciones de cada sección
        const sectionsWithLessons: SectionWithLessons[] = await Promise.all(
          sectionsData.map(async (section) => {
            const lessons = await CourseService.getSectionLessons(section.id);
            return {
              ...section,
              lessons
            };
          })
        );
        
        setSections(sectionsWithLessons);
        
        // Obtener el progreso del curso si el usuario está autenticado
        if (user) {
          const progressData = await getCourseProgress(courseId);
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
        console.error('Error fetching course data:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del curso",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId, user, navigate, getCourseProgress]);

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

  const levelColor = course.level === 'principiante' 
    ? 'bg-emerald-500' 
    : course.level === 'intermedio' 
      ? 'bg-amber-500' 
      : 'bg-red-500';

  return (
    <div 
      ref={contentRef} 
      className={`container px-4 py-8 mx-auto transition-opacity duration-500 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Contenido principal */}
        <div className="w-full md:w-2/3">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={`${levelColor} text-white px-2 py-1`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
            <Badge variant="outline">{course.category}</Badge>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>{Math.floor(course.duration_minutes / 60)} horas {course.duration_minutes % 60} min</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="mr-1 h-4 w-4" />
              <span>Por {course.instructor}</span>
            </div>
            <div className="flex items-center">
              <Award className="mr-1 h-4 w-4" />
              <span>{getTotalLessons()} lecciones</span>
            </div>
          </div>
          
          {/* Imagen del curso */}
          <div className="w-full h-60 md:h-80 bg-gray-100 rounded-lg mb-8 overflow-hidden">
            <img 
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
          
          <Tabs defaultValue="contenido">
            <TabsList className="mb-4">
              <TabsTrigger value="contenido">Contenido</TabsTrigger>
              <TabsTrigger value="descripcion">Descripción</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contenido" className="space-y-4">
              <h2 className="text-2xl font-bold">Contenido del curso</h2>
              {sections.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {sections.map((section) => (
                    <AccordionItem key={section.id} value={section.id} className="border rounded-lg mb-4 overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center">
                            <span className="font-semibold">{section.title}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{section.lessons.length} lecciones</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-0">
                        <div className="divide-y">
                          {section.lessons.map((lesson) => (
                            <div 
                              key={lesson.id} 
                              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
                            >
                              <div className="mr-3">
                                {completedLessons[lesson.id] ? (
                                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{lesson.title}</div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="mr-1 h-3 w-3" />
                                  <span>{lesson.duration_minutes} min</span>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-gray-500">No hay secciones disponibles para este curso</p>
              )}
            </TabsContent>
            
            <TabsContent value="descripcion">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-4">Descripción</h2>
                <p className="whitespace-pre-wrap">{course.description}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Panel lateral */}
        <div className="w-full md:w-1/3">
          <Card className="sticky top-24">
            <CardContent className="p-0">
              <div className="p-6">
                {progress > 0 ? (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tu progreso</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 mb-1" />
                    <p className="text-sm text-gray-500">
                      {getCompletedLessonsCount()} de {getTotalLessons()} lecciones completadas
                    </p>
                  </div>
                ) : user ? (
                  <div className="text-center mb-6">
                    <CircleDot className="h-12 w-12 mx-auto text-primary mb-2" />
                    <p className="font-medium">Aún no has comenzado este curso</p>
                    <p className="text-sm text-gray-500 mb-4">¡Empieza ahora para registrar tu progreso!</p>
                  </div>
                ) : (
                  <div className="text-center mb-6">
                    <BarChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="font-medium">Inicia sesión para registrar tu progreso</p>
                  </div>
                )}
                
                <Button 
                  className="w-full flex items-center justify-center mb-4" 
                  onClick={progress > 0 ? continueCourse : startCourse}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {progress > 0 ? 'Continuar aprendizaje' : 'Comenzar curso'}
                </Button>
                
                {!user && (
                  <p className="text-sm text-center text-gray-500">
                    Inicia sesión para guardar tu progreso
                  </p>
                )}
              </div>
              
              <Separator />
              
              <div className="p-6">
                <h3 className="font-semibold mb-4">Este curso incluye:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <BookOpen className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <span>{getTotalLessons()} lecciones</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <span>{Math.floor(course.duration_minutes / 60)} horas {course.duration_minutes % 60} minutos de contenido</span>
                  </li>
                  <li className="flex items-start">
                    <Award className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <span>Certificado de finalización</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
