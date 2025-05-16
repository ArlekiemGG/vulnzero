
// Importaciones
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

// Importación del componente LessonQuiz
import LessonQuiz from '@/components/courses/components/LessonQuiz';

const LessonDetail = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  const { markLessonAsCompleted } = useProgressService();
  
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

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
    if (!courseId || !lessonId) {
      toast({
        title: "Error",
        description: "No se especificó un ID de curso o lección",
        variant: "destructive",
      });
      navigate('/courses');
      return;
    }
    
    setIsLoading(true);
    setFadeIn(false);
    
    try {
      // Obtener datos de la lección y del curso usando el servicio híbrido
      const lessonData = await HybridCourseService.getLessonById(lessonId);
      const courseData = await HybridCourseService.getCourseById(courseId);
      
      if (!lessonData || !courseData) {
        toast({
          title: "Lección o curso no encontrado",
          description: "La lección o el curso que buscas no existe. Por favor, verifica la URL o contacta con soporte.",
          variant: "destructive",
        });
        navigate('/courses');
        return;
      }
      
      setLesson(lessonData);
      setCourse(courseData);
      document.title = `${lessonData.title} - ${courseData.title} - VulnZero`;
      
      // Verificar si la lección está completada
      if (user) {
        // Verificación del estado de completado usando el servicio de progreso
        const progress = await HybridCourseService.getLessonProgressByUserId(lessonId, user.id);
        setIsCompleted(progress?.completed || false);
      }
      
      // Verificar si la lección tiene un quiz asociado
      if (lessonData.quizData) {
        setQuizData(lessonData.quizData);
      }
    } catch (error) {
      console.error('Error fetching lesson data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la lección. Por favor, inténtalo más tarde.",
        variant: "destructive",
      });
      navigate(`/courses/${courseId}`);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId, user, navigate]);

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  const handleLessonComplete = async () => {
    if (!lessonId) return;
    
    try {
      const success = await markLessonAsCompleted(lessonId);
      if (success) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la lección como completada.",
        variant: "destructive",
      });
    }
  };

  const handleQuizComplete = async (score: number, answers: Record<string, number>) => {
    if (!lessonId) return;
    
    try {
      // Lógica para guardar los resultados del quiz y marcar la lección como completada
      // Esto dependerá de tu implementación específica
      setIsCompleted(true);
      toast({
        title: "Quiz completado",
        description: `Has obtenido ${score}% de respuestas correctas`,
      });
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los resultados del quiz.",
        variant: "destructive",
      });
    }
  };

  const goToNextLesson = () => {
    // Lógica para navegar a la siguiente lección
    toast({
      title: "Siguiente lección",
      description: "Te estamos redirigiendo a la siguiente lección del curso"
    });
    navigate(`/courses/${courseId}`);
  };

  const goToPreviousLesson = () => {
    // Lógica para navegar a la lección anterior
    toast({
      title: "Lección anterior",
      description: "Te estamos redirigiendo a la lección anterior del curso"
    });
    navigate(`/courses/${courseId}`);
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
                  courseId={courseId}
                  moduleId={lesson.module_id || "default"}
                  lessonId={lessonId}
                  onComplete={handleQuizComplete}
                  completed={isCompleted}
                />
              ) : (
                <Button 
                  onClick={handleLessonComplete} 
                  disabled={isCompleted}
                >
                  Marcar como completada
                </Button>
              )}
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={goToPreviousLesson}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Lección anterior
                </Button>
                <Button variant="outline" onClick={goToNextLesson}>
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
