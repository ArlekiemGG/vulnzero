
import { useState, useEffect, useCallback } from 'react';
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
export const useUserCourseProgress = (courseId?: string, userId?: string): CourseProgressHook => {
  const [progress, setProgress] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<CompletedLessonsMap>({});
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuizzesMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Función para cargar el progreso del usuario
  const loadUserProgress = useCallback(async () => {
    if (!courseId || !userId) {
      console.log("useUserCourseProgress: Missing courseId or userId, skipping fetch");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log(`useUserCourseProgress: Fetching progress for course ${courseId} and user ${userId}`);
      
      const result = await courseProgressService.fetchUserProgressData(courseId, userId);
      
      console.log('useUserCourseProgress: Progress data loaded:', result);
      console.log('useUserCourseProgress: Progress percentage:', result.progress);
      console.log('useUserCourseProgress: Completed lessons:', result.completedLessons);
      
      setProgress(result.progress);
      setCompletedLessons(result.completedLessons);
      setCompletedQuizzes(result.completedQuizzes);
    } catch (err) {
      console.error('useUserCourseProgress: Error fetching course progress:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el progreso del curso"
      });
    } finally {
      setIsLoading(false);
    }
  }, [courseId, userId]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProgress = async () => {
      if (!isMounted) return;
      await loadUserProgress();
    };

    fetchProgress();
    
    return () => {
      isMounted = false;
    };
  }, [loadUserProgress]);

  /**
   * Marca una lección como completada
   */
  const markLessonAsCompleted = async (moduleId: string, lessonId: string): Promise<boolean> => {
    if (!userId || !courseId) {
      console.log("useUserCourseProgress: Cannot mark lesson as completed: no user ID or course ID");
      return false;
    }
    
    // Usamos una estructura de clave consistente: courseId:lessonId y courseId:moduleId:lessonId
    const lessonKey = `${courseId}:${lessonId}`;
    const extendedLessonKey = `${courseId}:${moduleId}:${lessonId}`;
    
    try {
      console.log(`useUserCourseProgress: Marking lesson ${lessonId} as completed for course ${courseId} and user ${userId}`);
      console.log(`useUserCourseProgress: Using lesson keys: ${lessonKey} and ${extendedLessonKey}`);
      
      const success = await courseProgressService.markLessonComplete(userId, courseId, lessonId);
      
      if (success) {
        console.log("useUserCourseProgress: Lesson marked as completed successfully in backend");
        
        // Actualizamos el estado local para múltiples formatos de clave
        setCompletedLessons(prev => {
          const newState = { 
            ...prev, 
            [lessonKey]: true, 
            [extendedLessonKey]: true, 
            [lessonId]: true 
          };
          console.log("useUserCourseProgress: Updated completedLessons state:", newState);
          return newState;
        });
        
        // Actualizamos inmediatamente el estado local, pero también recuperamos el progreso actualizado
        const updatedProgressData = await courseProgressService.fetchUserProgressData(courseId, userId);
        setProgress(updatedProgressData.progress);
        console.log(`useUserCourseProgress: Updated progress from backend: ${updatedProgressData.progress}%`);
        
        return true;
      } else {
        console.log("useUserCourseProgress: Failed to mark lesson as completed in backend");
        return false;
      }
    } catch (err) {
      console.error('useUserCourseProgress: Error marking lesson as completed:', err);
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
    if (!userId || !courseId) {
      console.log("useUserCourseProgress: Cannot save quiz result: no user ID or course ID");
      return false;
    }
    
    // Usamos una estructura de clave consistente: courseId:lessonId
    const lessonKey = `${courseId}:${lessonId}`;
    const extendedLessonKey = `${courseId}:${moduleId}:${lessonId}`;
    
    try {
      console.log(`useUserCourseProgress: Saving quiz result for lesson ${lessonId}, course ${courseId}, user ${userId}`);
      const success = await courseProgressService.saveQuizResults(userId, courseId, lessonId, score, answers);
      
      if (success) {
        // Actualizamos el estado local
        setCompletedLessons(prev => {
          const newState = { 
            ...prev, 
            [lessonKey]: true, 
            [extendedLessonKey]: true, 
            [lessonId]: true 
          };
          console.log("useUserCourseProgress: Updated completedLessons state after quiz:", newState);
          return newState;
        });
        setCompletedQuizzes(prev => {
          const newState = { 
            ...prev, 
            [lessonKey]: true, 
            [extendedLessonKey]: true, 
            [lessonId]: true 
          };
          console.log("useUserCourseProgress: Updated completedQuizzes state:", newState);
          return newState;
        });
        
        // Actualizamos el progreso desde el backend
        const updatedProgressData = await courseProgressService.fetchUserProgressData(courseId, userId);
        setProgress(updatedProgressData.progress);
        console.log(`useUserCourseProgress: Updated progress after quiz: ${updatedProgressData.progress}%`);
        
        toast({
          title: "Quiz completado",
          description: `Has obtenido ${score}% de respuestas correctas`
        });
        
        return true;
      } else {
        console.log("useUserCourseProgress: Failed to save quiz results in backend");
        return false;
      }
    } catch (err) {
      console.error('useUserCourseProgress: Error saving quiz result:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los resultados del quiz"
      });
      return false;
    }
  };
  
  // Método para forzar la recarga del progreso
  const refreshProgress = async (): Promise<void> => {
    await loadUserProgress();
  };

  return {
    progress,
    completedLessons,
    completedQuizzes,
    isLoading,
    error,
    markLessonAsCompleted,
    saveQuizResult,
    refreshProgress
  };
};
