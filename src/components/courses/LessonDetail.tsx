
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HybridCourseService } from './services/HybridCourseService';
import { useProgressService } from './services/ProgressService';
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import MarkdownRenderer from './components/MarkdownRenderer';

const LessonDetail = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getLessonProgress, markLessonAsCompleted } = useProgressService();
  
  const [lesson, setLesson] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [completed, setCompleted] = useState<boolean>(false);
  const [nextLesson, setNextLesson] = useState<{id: string; title: string} | null>(null);
  const [prevLesson, setPrevLesson] = useState<{id: string; title: string} | null>(null);
  const [fadeIn, setFadeIn] = useState<boolean>(false);

  useEffect(() => {
    // Agregamos un efecto de fade-in cuando se cargan los datos
    if (!isLoading && lesson) {
      const timer = setTimeout(() => setFadeIn(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, lesson]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setFadeIn(false);
  }, [lessonId]);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId || !courseId) return;
      setIsLoading(true);
      
      try {
        // Obtener datos de la lección usando el servicio híbrido
        const lessonData = await HybridCourseService.getLessonById(lessonId);
        if (!lessonData) {
          toast({
            title: "Lección no encontrada",
            description: "La lección que buscas no existe",
            variant: "destructive",
          });
          navigate(`/courses/${courseId}`);
          return;
        }
        setLesson(lessonData);
        
        // Obtener sección a la que pertenece la lección
        const sectionsData = await HybridCourseService.getCourseSections(courseId);
        const currentSectionId = lessonData.section_id;
        const currentSection = sectionsData.find(s => s.id === currentSectionId);
        
        if (!currentSection) {
          toast({
            title: "Error",
            description: "No se pudo encontrar la sección de esta lección",
            variant: "destructive",
          });
          navigate(`/courses/${courseId}`);
          return;
        }
        
        // Obtener todas las lecciones de la sección para navegación
        const sectionLessons = await HybridCourseService.getSectionLessons(currentSectionId);
        const currentIndex = sectionLessons.findIndex(l => l.id === lessonId);
        
        // Configurar navegación a lección anterior
        if (currentIndex > 0) {
          setPrevLesson({
            id: sectionLessons[currentIndex - 1].id,
            title: sectionLessons[currentIndex - 1].title
          });
        } else {
          // Buscar la última lección de la sección anterior
          const currentSectionIndex = sectionsData.findIndex(s => s.id === currentSectionId);
          if (currentSectionIndex > 0) {
            const prevSectionId = sectionsData[currentSectionIndex - 1].id;
            const prevSectionLessons = await HybridCourseService.getSectionLessons(prevSectionId);
            if (prevSectionLessons.length > 0) {
              const lastLesson = prevSectionLessons[prevSectionLessons.length - 1];
              setPrevLesson({
                id: lastLesson.id,
                title: lastLesson.title
              });
            } else {
              setPrevLesson(null);
            }
          } else {
            setPrevLesson(null);
          }
        }
        
        // Configurar navegación a siguiente lección
        if (currentIndex < sectionLessons.length - 1) {
          setNextLesson({
            id: sectionLessons[currentIndex + 1].id,
            title: sectionLessons[currentIndex + 1].title
          });
        } else {
          // Buscar la primera lección de la siguiente sección
          const currentSectionIndex = sectionsData.findIndex(s => s.id === currentSectionId);
          if (currentSectionIndex < sectionsData.length - 1) {
            const nextSectionId = sectionsData[currentSectionIndex + 1].id;
            const nextSectionLessons = await HybridCourseService.getSectionLessons(nextSectionId);
            if (nextSectionLessons.length > 0) {
              setNextLesson({
                id: nextSectionLessons[0].id,
                title: nextSectionLessons[0].title
              });
            } else {
              setNextLesson(null);
            }
          } else {
            setNextLesson(null);
          }
        }
        
        // Verificar si la lección está completada (datos de progreso de Supabase)
        if (user) {
          const progress = await getLessonProgress(lessonId);
          setCompleted(progress?.completed || false);
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la lección",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLessonData();
  }, [courseId, lessonId, user, navigate, getLessonProgress]);

  const handleMarkAsCompleted = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para guardar tu progreso",
        variant: "destructive",
      });
      return;
    }
    
    const success = await markLessonAsCompleted(lessonId!);
    if (success) {
      setCompleted(true);
      
      // Si hay una siguiente lección, preguntar si quiere continuar
      if (nextLesson) {
        setTimeout(() => {
          toast({
            title: "¡Lección completada!",
            description: "¿Quieres continuar con la siguiente lección?",
            action: (
              <Button onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)}>
                Continuar
              </Button>
            )
          });
        }, 500);
      } else {
        toast({
          title: "¡Felicidades!",
          description: "Has completado todas las lecciones de este curso",
        });
      }
    }
  };

  const navigateToLesson = (id: string) => {
    navigate(`/courses/${courseId}/lessons/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <div className="space-y-4 mb-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="w-full md:w-1/4">
            <Skeleton className="h-60 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Lección no encontrada</h2>
          <p className="mt-2 text-gray-500">La lección que buscas no existe o ha sido eliminada</p>
          <Button className="mt-4" onClick={() => navigate(`/courses/${courseId}`)}>
            Volver al curso
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container px-4 py-8 mx-auto transition-opacity duration-500 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Contenido principal */}
        <div className="w-full md:w-3/4">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/courses/${courseId}`)}
              className="p-0 hover:bg-transparent hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Volver al curso</span>
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <BookOpen className="mr-1 h-4 w-4" />
            <span>{lesson.duration_minutes} minutos de lectura</span>
          </div>
          
          <div className="prose max-w-none mb-8">
            <MarkdownRenderer content={lesson.content} />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t">
            <div className="mb-4 sm:mb-0">
              {prevLesson && (
                <Button 
                  variant="outline" 
                  onClick={() => navigateToLesson(prevLesson.id)}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span>Anterior</span>
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {completed ? (
                <Button variant="outline" className="flex items-center" disabled>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>Completada</span>
                </Button>
              ) : (
                <Button onClick={handleMarkAsCompleted}>
                  Marcar como completada
                </Button>
              )}
              
              {nextLesson && (
                <Button 
                  onClick={() => navigateToLesson(nextLesson.id)}
                  className="flex items-center"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Panel lateral */}
        <div className="w-full md:w-1/4">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Navegación rápida</h3>
              
              {prevLesson && (
                <>
                  <div className="mb-3">
                    <div className="text-sm text-gray-500">Anterior</div>
                    <button 
                      onClick={() => navigateToLesson(prevLesson.id)}
                      className="text-left font-medium hover:text-primary transition-colors"
                    >
                      {prevLesson.title}
                    </button>
                  </div>
                  <Separator className="my-3" />
                </>
              )}
              
              <div className="mb-3">
                <div className="text-sm text-gray-500">Actual</div>
                <div className="font-medium text-primary">{lesson.title}</div>
              </div>
              
              {nextLesson && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <div className="text-sm text-gray-500">Siguiente</div>
                    <button 
                      onClick={() => navigateToLesson(nextLesson.id)}
                      className="text-left font-medium hover:text-primary transition-colors"
                    >
                      {nextLesson.title}
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
