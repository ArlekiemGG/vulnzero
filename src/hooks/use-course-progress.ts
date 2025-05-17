
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { courseProgressService } from '@/services/course-progress/course-progress-service';
import { useUser } from '@/contexts/UserContext';
import type { 
  CourseProgressHook, 
  CompletedLessonsMap, 
  CompletedQuizzesMap 
} from '@/types/course-progress';
import { HybridCourseService } from '@/components/courses/services/HybridCourseService';

/**
 * Hook para gestionar el progreso del curso
 */
export const useUserCourseProgress = (courseSlug?: string, userId?: string): CourseProgressHook => {
  const [progress, setProgress] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<CompletedLessonsMap>({});
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuizzesMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [courseId, setCourseId] = useState<string | undefined>(undefined);
  const { detailedProgress, refreshUserStats } = useUser();

  // Resolve course ID from slug
  useEffect(() => {
    const resolveCourseId = async () => {
      if (!courseSlug) return;
      
      try {
        const course = await HybridCourseService.getCourseById(courseSlug);
        if (course?.id && course.id !== courseSlug) {
          setCourseId(course.id);
        } else {
          setCourseId(courseSlug);
        }
      } catch (error) {
        console.error("Error resolving course ID from slug:", error);
        setCourseId(courseSlug);
      }
    };
    
    resolveCourseId();
  }, [courseSlug]);

  // Try to get progress from user context
  useEffect(() => {
    if (detailedProgress && courseId && !isLoading) {
      const courseProgress = detailedProgress.detailed_progress?.course_progress?.find(
        course => course.course_id === courseId
      );
      
      if (courseProgress) {
        setProgress(courseProgress.progress_percentage);
      }
    }
  }, [detailedProgress, courseId, isLoading]);

  // Load user progress function
  const loadUserProgress = useCallback(async () => {
    if (!courseId || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await courseProgressService.fetchUserProgressData(courseId, userId);
      
      setProgress(result.progress);
      setCompletedLessons(result.completedLessons);
      setCompletedQuizzes(result.completedQuizzes);
    } catch (err) {
      console.error('Error fetching course progress:', err);
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

  // Load progress on init
  useEffect(() => {
    let isMounted = true;
    
    const fetchProgress = async () => {
      if (!isMounted) return;
      await loadUserProgress();
    };

    if (courseId) {
      fetchProgress();
    }
    
    return () => {
      isMounted = false;
    };
  }, [loadUserProgress, courseId]);

  /**
   * Marca una lección como completada
   */
  const markLessonAsCompleted = async (moduleId: string, lessonId: string): Promise<boolean> => {
    if (!userId || !courseId) {
      return false;
    }
    
    const lessonKey = `${courseId}:${lessonId}`;
    const extendedLessonKey = `${courseId}:${moduleId}:${lessonId}`;
    
    try {
      // Llama al servicio sin normalizar el lessonId, el servicio se encargará de eso
      const success = await courseProgressService.markLessonComplete(userId, courseId, lessonId);
      
      if (success) {
        // Update local state
        setCompletedLessons(prev => ({
          ...prev, 
          [lessonKey]: true, 
          [extendedLessonKey]: true, 
          [lessonId]: true 
        }));
        
        // Get updated progress
        try {
          const updatedProgressData = await courseProgressService.fetchUserProgressData(courseId, userId);
          setProgress(updatedProgressData.progress);
        } catch (error) {
          console.error("Failed to fetch updated progress:", error);
        }
        
        // Update global user progress
        try {
          await refreshUserStats();
        } catch (error) {
          console.error("Failed to refresh user stats:", error);
        }
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error marking lesson as completed:', err);
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
      return false;
    }
    
    const lessonKey = `${courseId}:${lessonId}`;
    const extendedLessonKey = `${courseId}:${moduleId}:${lessonId}`;
    
    try {
      // Call service without normalizing lessonId, the service will handle that
      const success = await courseProgressService.saveQuizResults(userId, courseId, lessonId, score, answers);
      
      if (success) {
        // Update local state for lessons and quizzes
        setCompletedLessons(prev => ({
          ...prev, 
          [lessonKey]: true, 
          [extendedLessonKey]: true, 
          [lessonId]: true 
        }));
        
        setCompletedQuizzes(prev => ({
          ...prev, 
          [lessonKey]: true, 
          [extendedLessonKey]: true, 
          [lessonId]: true 
        }));
        
        // Get updated progress
        try {
          const updatedProgressData = await courseProgressService.fetchUserProgressData(courseId, userId);
          setProgress(updatedProgressData.progress);
        } catch (error) {
          console.error("Failed to fetch updated progress after quiz:", error);
        }
        
        // Update global user progress
        try {
          await refreshUserStats();
        } catch (error) {
          console.error("Failed to refresh user stats after quiz:", error);
        }
        
        toast({
          title: "Quiz completado",
          description: `Has obtenido ${score}% de respuestas correctas`
        });
        
        return true;
      }
      
      return false;
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
  
  // Method to force refresh progress
  const refreshProgress = async (): Promise<void> => {
    await loadUserProgress();
    await refreshUserStats();
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
