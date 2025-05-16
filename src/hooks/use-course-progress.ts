
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { courseProgressService } from '@/services/course-progress-service';
import type { 
  CourseProgressHook, 
  CompletedLessonsMap, 
  CompletedQuizzesMap 
} from '@/types/course-progress';

/**
 * Hook para gestionar el progreso del curso
 */
export const useUserCourseProgress = (courseId: string, userId?: string): CourseProgressHook => {
  const [progress, setProgress] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<CompletedLessonsMap>({});
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuizzesMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProgress = async () => {
      if (!courseId || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching progress for course ${courseId} and user ${userId}`);
        
        const result = await courseProgressService.fetchUserProgressData(courseId, userId);
        
        if (isMounted) {
          console.log('Progress data loaded:', result);
          setProgress(result.progress);
          setCompletedLessons(result.completedLessons);
          setCompletedQuizzes(result.completedQuizzes);
        }
      } catch (err) {
        console.error('Error fetching course progress:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo cargar el progreso del curso"
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProgress();
    
    return () => {
      isMounted = false;
    };
  }, [courseId, userId]);

  /**
   * Marca una lección como completada
   */
  const markLessonAsCompleted = async (moduleId: string, lessonId: string): Promise<boolean> => {
    if (!userId || !courseId) return false;
    
    // Usamos una estructura de clave consistente: courseId:lessonId
    const lessonKey = `${courseId}:${lessonId}`;
    
    try {
      console.log(`Marking lesson ${lessonId} as completed for course ${courseId} and user ${userId}`);
      const success = await courseProgressService.markLessonComplete(userId, courseId, lessonId);
      
      if (success) {
        // Actualizamos el estado local
        setCompletedLessons(prev => ({ ...prev, [lessonKey]: true, [lessonId]: true }));
        setProgress(prev => {
          // Estimación simple hasta la próxima carga de datos
          const newProgress = Math.min(100, prev + 5);
          return newProgress;
        });
        
        toast({
          title: "Lección completada",
          description: "Tu progreso ha sido guardado"
        });
      }
      
      return success;
    } catch (err) {
      console.error('Error marking lesson as completed:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo marcar la lección como completada"
      });
      return false;
    }
  };

  /**
   * Guarda los resultados del quiz y marca la lección como completada
   */
  const saveQuizResult = async (
    moduleId: string, 
    lessonId: string, 
    score: number, 
    answers: Record<string, number>
  ): Promise<boolean> => {
    if (!userId || !courseId) return false;
    
    // Usamos una estructura de clave consistente: courseId:lessonId
    const lessonKey = `${courseId}:${lessonId}`;
    
    try {
      console.log(`Saving quiz result for lesson ${lessonId}, course ${courseId}, user ${userId}`);
      const success = await courseProgressService.saveQuizResults(userId, courseId, lessonId, score, answers);
      
      if (success) {
        // Actualizamos el estado local
        setCompletedLessons(prev => ({ ...prev, [lessonKey]: true, [lessonId]: true }));
        setCompletedQuizzes(prev => ({ ...prev, [lessonKey]: true, [lessonId]: true }));
        
        toast({
          title: "Quiz completado",
          description: `Has obtenido ${score}% de respuestas correctas`
        });
      }
      
      return success;
    } catch (err) {
      console.error('Error saving quiz result:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los resultados del quiz"
      });
      return false;
    }
  };

  return {
    progress,
    completedLessons,
    completedQuizzes,
    isLoading,
    error,
    markLessonAsCompleted,
    saveQuizResult
  };
};
