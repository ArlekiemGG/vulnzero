
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';
import { HybridCourseService } from '@/components/courses/services/HybridCourseService';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, ArrowRight, Check, Clock, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProgressService } from '@/components/courses/services/ProgressService';
import LessonQuiz from '@/components/courses/components/LessonQuiz';
import LessonCompletionButton from '@/components/courses/components/LessonCompletionButton';
import { useUserCourseProgress } from '@/hooks/use-course-progress';

const LessonDetail = () => {
  const { courseId, moduleId, lessonId } = useParams<{ courseId: string; moduleId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  const { markLessonAsCompleted, getLessonProgress } = useProgressService();
  const { refreshProgress } = useUserCourseProgress(courseId, user?.id);
  
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [prevLessonData, setPrevLessonData] = useState<any>(null);
  const [nextLessonData, setNextLessonData] = useState<any>(null);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setFadeIn(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId, courseId]);

  const fetchLessonData = useCallback(async () => {
    if (!courseId || !lessonId || !moduleId) {
      console.error("LessonDetail: Missing required params", { courseId, lessonId, moduleId });
      toast({
        title: "Error",
        description: "No se especificó un ID de curso, módulo o lección",
        variant: "destructive",
      });
      navigate('/courses');
      return;
    }
    
    setIsLoading(true);
    setFadeIn(false);
    
    try {
      console.log(`LessonDetail: Loading lesson ${lessonId} in module ${moduleId} for course ${courseId}`);
      
      // Obtener datos de la lección y del curso usando el servicio híbrido
      const lessonData = await HybridCourseService.getLessonById(lessonId);
      const courseData = await HybridCourseService.getCourseById(courseId);
      
      if (!lessonData || !courseData) {
        console.error("LessonDetail: Lesson or course not found", { lessonData, courseData });
        toast({
          title: "Lección o curso no encontrado",
          description: "La lección o el curso que buscas no existe. Por favor, verifica la URL o contacta con soporte.",
          variant: "destructive",
        });
        navigate('/courses');
        return;
      }
      
      console.log("LessonDetail: Lesson data loaded:", lessonData);
      console.log("LessonDetail: Course data loaded:", courseData);
      
      setLesson(lessonData);
      setCourse(courseData);
      document.title = `${lessonData.title} - ${courseData.title} - VulnZero`;
      
      // Verificar si la lección está completada
      if (user) {
        // Verificación del estado de completado usando el servicio de progreso
        console.log(`LessonDetail: Checking completion status for lesson ${lessonId}`);
        const progress = await getLessonProgress(lessonId);
        const isLessonCompleted = progress?.completed || false;
        console.log(`LessonDetail: Lesson completion status: ${isLessonCompleted}`);
        setIsCompleted(isLessonCompleted);
      }
      
      // Configurar navegación entre lecciones
      await setupNavigation(courseId, moduleId, lessonId);
      
      // Para evitar errores de tipado, verificamos si hay datos de quiz de forma segura
      try {
        const quizPath = `/courses/${courseId}/${moduleId}/${lessonId}-quiz.json`;
        console.log(`LessonDetail: Checking for quiz data at ${quizPath}`);
        const response = await fetch(quizPath);
        if (response.ok) {
          const quizContent = await response.json();
          console.log(`LessonDetail: Quiz data loaded:`, quizContent);
          setQuizData(quizContent);
          // Actualizamos lesson con el quizData para mantener compatibilidad
          lessonData.quizData = quizContent;
        }
      } catch (quizError) {
        console.log('LessonDetail: No quiz found for this lesson or quiz error:', quizError);
        // Quiz no encontrado, no es un error crítico
      }
      
    } catch (error) {
      console.error('LessonDetail: Error fetching lesson data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la lección. Por favor, inténtalo más tarde.",
        variant: "destructive",
      });
      navigate(`/courses/${courseId}`);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId, moduleId, user, navigate, getLessonProgress]);

  const setupNavigation = async (courseId: string, moduleId: string, lessonId: string) => {
    try {
      console.log(`LessonDetail: Setting up navigation for lesson ${lessonId} in module ${moduleId}`);
      
      // Obtener secciones del curso
      const sections = await HybridCourseService.getCourseSections(courseId);
      console.log(`LessonDetail: Got ${sections.length} sections for course ${courseId}`);
      
      // Obtener lecciones de la sección actual
      const lessons = await HybridCourseService.getSectionLessons(moduleId);
      console.log(`LessonDetail: Got ${lessons.length} lessons for module ${moduleId}`);
      
      // Encontrar el índice de la lección actual
      const currentIndex = lessons.findIndex(l => l.id === lessonId);
      console.log(`LessonDetail: Current lesson index: ${currentIndex}`);
      
      // Configurar navegación a lección anterior
      if (currentIndex > 0) {
        const prevLesson = lessons[currentIndex - 1];
        console.log(`LessonDetail: Previous lesson is ${prevLesson.id}: ${prevLesson.title}`);
        setPrevLessonData({
          id: prevLesson.id,
          title: prevLesson.title,
          moduleId: moduleId
        });
      } else {
        // Buscar la última lección de la sección anterior
        const currentSectionIndex = sections.findIndex(s => s.id === moduleId);
        if (currentSectionIndex > 0) {
          const prevSectionId = sections[currentSectionIndex - 1].id;
          console.log(`LessonDetail: Looking for last lesson in previous section ${prevSectionId}`);
          const prevSectionLessons = await HybridCourseService.getSectionLessons(prevSectionId);
          if (prevSectionLessons.length > 0) {
            const lastLesson = prevSectionLessons[prevSectionLessons.length - 1];
            console.log(`LessonDetail: Previous lesson is ${lastLesson.id}: ${lastLesson.title} (from previous section)`);
            setPrevLessonData({
              id: lastLesson.id,
              title: lastLesson.title,
              moduleId: prevSectionId
            });
          } else {
            console.log(`LessonDetail: No lessons found in previous section ${prevSectionId}`);
            setPrevLessonData(null);
          }
        } else {
          console.log(`LessonDetail: No previous section found, this is the first lesson`);
          setPrevLessonData(null);
        }
      }
      
      // Configurar navegación a siguiente lección
      if (currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1];
        console.log(`LessonDetail: Next lesson is ${nextLesson.id}: ${nextLesson.title}`);
        setNextLessonData({
          id: nextLesson.id,
          title: nextLesson.title,
          moduleId: moduleId
        });
      } else {
        // Buscar la primera lección de la siguiente sección
        const currentSectionIndex = sections.findIndex(s => s.id === moduleId);
        if (currentSectionIndex < sections.length - 1) {
          const nextSectionId = sections[currentSectionIndex + 1].id;
          console.log(`LessonDetail: Looking for first lesson in next section ${nextSectionId}`);
          const nextSectionLessons = await HybridCourseService.getSectionLessons(nextSectionId);
          if (nextSectionLessons.length > 0) {
            const firstLesson = nextSectionLessons[0];
            console.log(`LessonDetail: Next lesson is ${firstLesson.id}: ${firstLesson.title} (from next section)`);
            setNextLessonData({
              id: firstLesson.id,
              title: firstLesson.title,
              moduleId: nextSectionId
            });
          } else {
            console.log(`LessonDetail: No lessons found in next section ${nextSectionId}`);
            setNextLessonData(null);
          }
        } else {
          console.log(`LessonDetail: No next section found, this is the last lesson`);
          setNextLessonData(null);
        }
      }
    } catch (error) {
      console.error('LessonDetail: Error setting up navigation:', error);
    }
  };

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  const handleLessonComplete = async () => {
    if (!lessonId) return;
    
    try {
      console.log(`LessonDetail: Marking lesson ${lessonId} as completed`);
      const success = await markLessonAsCompleted(lessonId);
      
      if (success) {
        console.log("LessonDetail: Lesson marked as completed successfully");
        setIsCompleted(true);
        
        // Refrescar el progreso global del curso
        if (courseId && user?.id) {
          console.log(`LessonDetail: Refreshing course progress for ${courseId}`);
          await refreshProgress();
        }
        
        toast({
          title: "Lección completada", 
          description: "Se ha guardado tu progreso correctamente"
        });
      } else {
        console.error("LessonDetail: Failed to mark lesson as completed");
        toast({
          title: "Error",
          description: "No se pudo marcar la lección como completada",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('LessonDetail: Error marking lesson as completed:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la lección como completada.",
        variant: "destructive",
      });
    }
  };

  const handleQuizComplete = async (score: number, answers: Record<string, number>) => {
    if (!lessonId || !courseId) return;
    
    try {
      console.log(`LessonDetail: Quiz completed with score ${score}`);
      
      // Lógica para guardar los resultados del quiz y marcar la lección como completada
      const success = await markLessonAsCompleted(lessonId);
      
      if (success) {
        console.log("LessonDetail: Quiz completion marked successfully");
        setIsCompleted(true);
        
        // Refrescar el progreso global del curso
        if (courseId && user?.id) {
          console.log(`LessonDetail: Refreshing course progress for ${courseId}`);
          await refreshProgress();
        }
        
        toast({
          title: "Quiz completado",
          description: `Has obtenido ${score}% de respuestas correctas`,
        });
      } else {
        console.error("LessonDetail: Failed to mark quiz as completed");
        toast({
          title: "Error",
          description: "No se pudieron guardar los resultados del quiz.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('LessonDetail: Error saving quiz results:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los resultados del quiz.",
        variant: "destructive",
      });
    }
  };

  const goToNextLesson = () => {
    if (nextLessonData) {
      console.log(`LessonDetail: Navigating to next lesson ${nextLessonData.id} in module ${nextLessonData.moduleId}`);
      toast({
        title: "Siguiente lección",
        description: "Te estamos redirigiendo a la siguiente lección del curso"
      });
      navigate(`/courses/${courseId}/learn/${nextLessonData.moduleId}/${nextLessonData.id}`);
    }
  };

  const goToPreviousLesson = () => {
    if (prevLessonData) {
      console.log(`LessonDetail: Navigating to previous lesson ${prevLessonData.id} in module ${prevLessonData.moduleId}`);
      toast({
        title: "Lección anterior",
        description: "Te estamos redirigiendo a la lección anterior del curso"
      });
      navigate(`/courses/${courseId}/learn/${prevLessonData.moduleId}/${prevLessonData.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-64 w-full mb-8" />
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return <div className="container px-4 py-8 mx-auto">Lección no encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`pt-16 pb-8 ${user ? 'md:pl-64' : ''}`}>
        <div className={`container px-4 py-8 mx-auto transition-opacity duration-700 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{lesson.title}</h1>
                  <p className="text-gray-400">{course.title}</p>
                </div>
                
                {isCompleted ? (
                  <Badge variant="success">
                    <Check className="h-4 w-4 mr-2" />
                    Completada
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    En curso
                  </Badge>
                )}
              </div>
              
              <div className="prose dark:prose-invert max-w-none mb-8">
                {lesson.content}
              </div>
              
              {quizData ? (
                <LessonQuiz 
                  courseId={courseId || ''}
                  moduleId={moduleId || "default"}
                  lessonId={lessonId || ''}
                  onComplete={handleQuizComplete}
                  completed={isCompleted}
                />
              ) : (
                <LessonCompletionButton 
                  isCompleted={isCompleted}
                  onComplete={handleLessonComplete}
                />
              )}
              
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={goToPreviousLesson}
                  disabled={!prevLessonData}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Lección anterior
                </Button>
                <Button 
                  variant="outline" 
                  onClick={goToNextLesson}
                  disabled={!nextLessonData}
                >
                  Siguiente lección
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LessonDetail;
