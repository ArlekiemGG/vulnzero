
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserCourseProgress = (courseId: string, userId?: string) => {
  const [progress, setProgress] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, boolean>>({});
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

        // Fetch course progress data
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('progress_percentage, completed')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle();

        if (progressError) throw progressError;

        // Fetch completed lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('user_lesson_progress')
          .select('lesson_key, completed')
          .eq('user_id', userId)
          .eq('course_id', courseId);

        if (lessonsError) throw lessonsError;

        // Fetch completed quizzes
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('user_quiz_results')
          .select('lesson_key, completed')
          .eq('user_id', userId)
          .eq('course_id', courseId);

        if (quizzesError) throw quizzesError;

        // Process and set data
        if (progressData) {
          setProgress(progressData.progress_percentage || 0);
        }

        const completedLessonsMap: Record<string, boolean> = {};
        if (lessonsData) {
          lessonsData.forEach(item => {
            if (item.completed) {
              completedLessonsMap[item.lesson_key] = true;
            }
          });
        }
        setCompletedLessons(completedLessonsMap);

        const completedQuizzesMap: Record<string, boolean> = {};
        if (quizzesData) {
          quizzesData.forEach(item => {
            if (item.completed) {
              completedQuizzesMap[item.lesson_key] = true;
            }
          });
        }
        setCompletedQuizzes(completedQuizzesMap);

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
    
    const lessonKey = `${courseId}:${moduleId}:${lessonId}`;
    
    try {
      // Check if the lesson is already marked as completed
      const { data: existingProgress } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('lesson_key', lessonKey)
        .maybeSingle();
      
      if (existingProgress) {
        // Update existing record
        const { error } = await supabase
          .from('user_lesson_progress')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', existingProgress.id);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: userId,
            course_id: courseId,
            lesson_key: lessonKey,
            module_id: moduleId,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setCompletedLessons(prev => ({ ...prev, [lessonKey]: true }));
      
      // Update course progress
      await updateCourseProgress(courseId, userId);
      
      return true;
    } catch (err) {
      console.error('Error marking lesson as completed:', err);
      return false;
    }
  };

  const saveQuizResult = async (moduleId: string, lessonId: string, score: number, answers: Record<string, number>): Promise<boolean> => {
    if (!userId || !courseId) return false;
    
    const lessonKey = `${courseId}:${moduleId}:${lessonId}`;
    
    try {
      // Check if quiz result already exists
      const { data: existingResult } = await supabase
        .from('user_quiz_results')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('lesson_key', lessonKey)
        .maybeSingle();
      
      if (existingResult) {
        // Update existing record
        const { error } = await supabase
          .from('user_quiz_results')
          .update({ 
            score, 
            answers, 
            completed: true, 
            completed_at: new Date().toISOString() 
          })
          .eq('id', existingResult.id);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_quiz_results')
          .insert({
            user_id: userId,
            course_id: courseId,
            module_id: moduleId,
            lesson_id: lessonId,
            lesson_key: lessonKey,
            score,
            answers,
            completed: true,
            completed_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setCompletedQuizzes(prev => ({ ...prev, [lessonKey]: true }));
      
      // If quiz is completed, mark lesson as completed as well
      if (!completedLessons[lessonKey]) {
        await markLessonAsCompleted(moduleId, lessonId);
      }
      
      return true;
    } catch (err) {
      console.error('Error saving quiz result:', err);
      return false;
    }
  };

  const updateCourseProgress = async (courseId: string, userId: string): Promise<void> => {
    try {
      // Calculate total lessons in the course
      const totalLessons = await calculateTotalLessons(courseId, userId);
      if (!totalLessons) return;
      
      // Calculate completed lessons
      const { data: completedLessonsData } = await supabase
        .from('user_lesson_progress')
        .select('lesson_key')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true);
      
      const completedCount = completedLessonsData?.length || 0;
      const progressPercentage = Math.round((completedCount / totalLessons) * 100);
      const completed = progressPercentage === 100;
      
      // Check if course progress record exists
      const { data: existingProgress } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();
      
      const updateData = {
        progress_percentage: progressPercentage,
        completed,
        completed_at: completed ? new Date().toISOString() : null
      };
      
      if (existingProgress) {
        // Update existing record
        await supabase
          .from('user_course_progress')
          .update(updateData)
          .eq('id', existingProgress.id);
      } else {
        // Create new record
        await supabase
          .from('user_course_progress')
          .insert({
            user_id: userId,
            course_id: courseId,
            ...updateData,
            started_at: new Date().toISOString()
          });
      }
      
      // Update local state
      setProgress(progressPercentage);
      
    } catch (err) {
      console.error('Error updating course progress:', err);
    }
  };

  const calculateTotalLessons = async (courseId: string, userId: string): Promise<number> => {
    try {
      // Count total lessons from user_lesson_progress table
      const { count, error } = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId);
      
      if (error) throw error;
      
      return count || 0;
    } catch (err) {
      console.error('Error calculating total lessons:', err);
      return 0;
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
