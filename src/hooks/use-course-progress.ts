
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchUserProgressData, 
  markLessonComplete, 
  saveQuizResults, 
  updateCourseProgressData 
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
    const fetchProgress = async () => {
      if (!courseId || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const result = await fetchUserProgressData(courseId, userId);
        setProgress(result.progress);
        setCompletedLessons(result.completedLessons);
        setCompletedQuizzes(result.completedQuizzes);
      } catch (err) {
        console.error('Error fetching course progress:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [courseId, userId]);

  const markLessonAsCompleted = async (moduleId: string, lessonId: string): Promise<boolean> => {
    if (!userId || !courseId) return false;
    
    const lessonKey = `${courseId}:${lessonId}`;
    
    try {
      const success = await markLessonComplete(userId, courseId, lessonId);
      
      if (success) {
        // Update local state
        setCompletedLessons(prev => ({ ...prev, [lessonKey]: true }));
      }
      
      return success;
    } catch (err) {
      console.error('Error marking lesson as completed:', err);
      return false;
    }
  };

  const saveQuizResult = async (moduleId: string, lessonId: string, score: number, answers: Record<string, number>): Promise<boolean> => {
    if (!userId || !courseId) return false;
    
    const lessonKey = `${courseId}:${lessonId}`;
    
    try {
      const success = await saveQuizResults(userId, courseId, lessonId, score, answers);
      
      if (success) {
        // Update local state
        setCompletedLessons(prev => ({ ...prev, [lessonKey]: true }));
        setCompletedQuizzes(prev => ({ ...prev, [lessonKey]: true }));
      }
      
      return success;
    } catch (err) {
      console.error('Error saving quiz result:', err);
      return false;
    }
  };

  const updateCourseProgress = async (): Promise<void> => {
    try {
      if (!userId || !courseId) return;
      
      const updatedProgress = await updateCourseProgressData(userId, courseId);
      
      // Update local state
      setProgress(updatedProgress);
    } catch (err) {
      console.error('Error updating course progress:', err);
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
