
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
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId);

        if (lessonsError) throw lessonsError;

        // Process and set data
        if (progressData) {
          setProgress(progressData.progress_percentage || 0);
        }

        const completedLessonsMap: Record<string, boolean> = {};
        const completedQuizzesMap: Record<string, boolean> = {};
        
        if (lessonsData) {
          lessonsData.forEach(item => {
            if (item.completed) {
              // Create lesson key using courseId and lessonId
              const lessonKey = `${courseId}:${item.lesson_id}`;
              completedLessonsMap[lessonKey] = true;
              
              // Check for quiz completion using a type-safe property access
              // We need to use type assertion since the database schema might have this field
              // but TypeScript doesn't know about it
              const lessonWithQuizData = item as any;
              if (lessonWithQuizData.quiz_completed) {
                completedQuizzesMap[lessonKey] = true;
              }
            }
          });
        }
        
        setCompletedLessons(completedLessonsMap);
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
    
    const lessonKey = `${courseId}:${lessonId}`;
    
    try {
      // Check if the lesson is already marked as completed
      const { data: existingProgress } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('lesson_id', lessonId)
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
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setCompletedLessons(prev => ({ ...prev, [lessonKey]: true }));
      
      // Update course progress
      await updateCourseProgress();
      
      return true;
    } catch (err) {
      console.error('Error marking lesson as completed:', err);
      return false;
    }
  };

  const saveQuizResult = async (moduleId: string, lessonId: string, score: number, answers: Record<string, number>): Promise<boolean> => {
    if (!userId || !courseId) return false;
    
    const lessonKey = `${courseId}:${lessonId}`;
    
    try {
      // Check if lesson progress already exists
      const { data: existingLesson } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (existingLesson) {
        // Update existing record with quiz results using the column might not be defined in type
        const updateData: Record<string, any> = { 
          completed: true,
          completed_at: new Date().toISOString(),
          quiz_completed: true,
          quiz_score: score,
          quiz_answers: answers,
          quiz_completed_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('user_lesson_progress')
          .update(updateData)
          .eq('id', existingLesson.id);
        
        if (error) throw error;
      } else {
        // Create new lesson progress record with quiz results
        const insertData: Record<string, any> = {
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
          quiz_completed: true,
          quiz_score: score,
          quiz_answers: answers,
          quiz_completed_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('user_lesson_progress')
          .insert(insertData);
        
        if (error) throw error;
      }
      
      // Update local state
      setCompletedLessons(prev => ({ ...prev, [lessonKey]: true }));
      setCompletedQuizzes(prev => ({ ...prev, [lessonKey]: true }));
      
      // Update course progress
      await updateCourseProgress();
      
      return true;
    } catch (err) {
      console.error('Error saving quiz result:', err);
      return false;
    }
  };

  const updateCourseProgress = async (): Promise<void> => {
    try {
      if (!userId || !courseId) return;
      
      // Count total lessons in the course based on user_lesson_progress records
      const { count: totalLessonsCount, error: countError } = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId);
      
      if (countError) throw countError;
      
      // Calculate completed lessons
      const { data: completedLessonsData, error: completedError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true);
      
      if (completedError) throw completedError;
      
      const totalLessons = totalLessonsCount || 0;
      const completedCount = completedLessonsData?.length || 0;
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
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
