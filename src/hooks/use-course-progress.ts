
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { 
  fetchUserProgressData, 
  markLessonComplete, 
  saveQuizResults 
} from '@/services/course-progress';
import type { 
  CourseProgressHook, 
  CompletedLessonsMap, 
  CompletedQuizzesMap 
} from '@/types/course-progress';

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
        
        const result = await fetchUserProgressData(courseId, userId);
        
        if (isMounted) {
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

  const markLessonAsCompleted = async (moduleId: string, lessonId: string): Promise<boolean> => {
    if (!userId || !courseId) return false;
    
    const lessonKey = `${courseId}:${moduleId}:${lessonId}`;
    
    try {
      const success = await markLessonComplete(userId, courseId, lessonId);
      
      if (success) {
        // Update local state
        setCompletedLessons(prev => ({ ...prev, [lessonKey]: true }));
        setProgress(prev => {
          // Simple estimation, will be corrected on next data fetch
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

  const saveQuizResult = async (moduleId: string, lessonId: string, score: number, answers: Record<string, number>): Promise<boolean> => {
    if (!userId || !courseId) return false;
    
    const lessonKey = `${courseId}:${moduleId}:${lessonId}`;
    
    try {
      const success = await saveQuizResults(userId, courseId, lessonId, score, answers);
      
      if (success) {
        // Update local state
        setCompletedLessons(prev => ({ ...prev, [lessonKey]: true }));
        setCompletedQuizzes(prev => ({ ...prev, [lessonKey]: true }));
        
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
