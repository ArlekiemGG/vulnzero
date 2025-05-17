
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { normalizeId } from '@/utils/uuid-generator';
import { courseProgressService } from '@/services/course-progress/course-progress-service';

/**
 * Service for managing lesson progress with direct database access
 * This is a simplified version that bypasses the complex service chain
 */
export function useProgressService() {
  const userContext = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUserStats } = useUser();

  /**
   * Obtiene el progreso de una lección específica directamente de la base de datos
   */
  const getLessonProgress = useCallback(async (lessonId: string) => {
    if (!userContext.user) return null;
    
    try {
      // Normalize the lessonId for consistency
      const normalizedLessonId = normalizeId(lessonId);
      
      console.log(`ProgressService: Checking progress for lesson ${lessonId} (normalized: ${normalizedLessonId})`);
      
      // Try with normalized ID first
      const { data: normalizedData, error: normalizedError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userContext.user.id)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
      
      if (normalizedData) {
        console.log(`ProgressService: Found progress with normalized ID`);
        return normalizedData;
      }
      
      // If not found with normalized ID, try with original ID
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userContext.user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
        console.error("ProgressService: Error checking lesson progress:", error);
      }
      
      return data;
    } catch (error) {
      console.error("ProgressService: Error getting lesson progress:", error);
      return null;
    }
  }, [userContext.user]);

  /**
   * Marca una lección como completada directamente en la base de datos
   */
  const markLessonAsCompleted = useCallback(async (lessonId: string, moduleId?: string) => {
    if (!userContext.user) {
      console.error("ProgressService: No user logged in");
      throw new Error("No user logged in");
    }

    setIsLoading(true);
    
    try {
      console.log(`ProgressService: Marking lesson ${lessonId} as completed`);
      
      // Extract courseId from URL - this is the most reliable method
      const currentUrl = window.location.pathname;
      const urlPattern = /\/courses\/([^\/]+)\/learn/;
      const match = currentUrl.match(urlPattern);
      
      if (!match || !match[1]) {
        console.error(`ProgressService: Could not extract course ID from URL: ${currentUrl}`);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo determinar el curso al que pertenece esta lección"
        });
        setIsLoading(false);
        throw new Error("Could not extract course ID from URL");
      }
      
      const courseId = match[1];
      const normalizedCourseId = normalizeId(courseId);
      
      console.log(`ProgressService: Extracted courseId ${courseId} from URL (normalized: ${normalizedCourseId})`);
      console.log(`ProgressService: Lesson ${lessonId} belongs to course ${courseId}`);
      
      // First try to use the courseProgressService
      console.log(`ProgressService: Using courseProgressService first...`);
      try {
        const serviceSuccess = await courseProgressService.markLessonComplete(
          userContext.user.id, 
          normalizedCourseId,
          lessonId
        );
        
        if (serviceSuccess) {
          console.log(`ProgressService: courseProgressService completed successfully`);
          
          // Update global user stats
          await refreshUserStats();
          
          setIsLoading(false);
          return true;
        }
        
        console.log(`ProgressService: courseProgressService failed, falling back to direct method`);
      } catch (serviceError) {
        console.error('ProgressService: Error using courseProgressService:', serviceError);
        console.log(`ProgressService: Falling back to direct method`);
      }
      
      // Check if a record already exists
      const { data: existingProgress } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userContext.user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      const now = new Date().toISOString();
      let success = false;
      
      if (existingProgress) {
        console.log(`ProgressService: Updating existing progress record ${existingProgress.id}`);
        
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_lesson_progress')
          .update({
            completed: true,
            completed_at: now,
            course_id: normalizedCourseId
          })
          .eq('id', existingProgress.id);
        
        if (updateError) {
          console.error("ProgressService: Error updating lesson progress:", updateError);
          throw updateError;
        }
        
        success = true;
      } else {
        console.log(`ProgressService: Creating new progress record`);
        
        // Create new record
        const { error: insertError } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: userContext.user.id,
            lesson_id: lessonId,
            course_id: normalizedCourseId,
            completed: true,
            completed_at: now
          });
        
        if (insertError) {
          console.error("ProgressService: Error creating lesson progress:", insertError);
          throw insertError;
        }
        
        success = true;
      }

      if (success) {
        // Update course progress
        await updateCourseProgress(userContext.user.id, normalizedCourseId);
        
        // Log user activity
        try {
          await supabase.rpc('log_user_activity', {
            p_user_id: userContext.user.id,
            p_type: 'lesson_completion',
            p_title: `Completó una lección del curso`,
            p_points: 10
          });
        } catch (activityError) {
          console.error("ProgressService: Error logging activity:", activityError);
          // Don't fail the operation if this fails
        }
        
        // Refresh global stats
        await refreshUserStats();
        console.log("ProgressService: User stats refreshed");
        
        setIsLoading(false);
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo guardar el progreso de la lección"
        });
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("ProgressService: Error marking lesson as completed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al guardar el progreso"
      });
      setIsLoading(false);
      throw error; // Rethrow to indicate failure to caller
    }
  }, [userContext.user, refreshUserStats]);
  
  /**
   * Updates course progress based on completed lessons
   * This is a simplified, direct implementation
   */
  const updateCourseProgress = async (userId: string, courseId: string): Promise<boolean> => {
    try {
      console.log(`ProgressService: Updating course progress for ${courseId}`);
      
      // Count total lessons
      const { count: totalCount, error: countError } = await supabase
        .from('course_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('section_id', courseId);
      
      if (countError && countError.code !== 'PGRST116') {
        console.error("ProgressService: Error counting lessons:", countError);
      }
      
      // Count completed lessons
      const { data: completedData, error: completedError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true);
      
      if (completedError) {
        console.error("ProgressService: Error counting completed lessons:", completedError);
        return false;
      }
      
      // Calculate progress percentage
      const totalLessons = totalCount || 0;
      const completedLessons = completedData?.length || 0;
      
      const progressPercentage = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100)
        : completedLessons > 0 ? 100 : 0;
      
      const isCompleted = totalLessons > 0 && completedLessons >= totalLessons;
      const now = new Date().toISOString();
      
      // Check if there's an existing course progress record
      const { data: existingProgress } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();
      
      if (existingProgress) {
        console.log(`ProgressService: Updating course progress to ${progressPercentage}%`);
        
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_course_progress')
          .update({
            progress_percentage: progressPercentage,
            completed: isCompleted,
            completed_at: isCompleted ? now : null
          })
          .eq('id', existingProgress.id);
        
        if (updateError) {
          console.error("ProgressService: Error updating course progress:", updateError);
          return false;
        }
      } else {
        console.log(`ProgressService: Creating new course progress record with ${progressPercentage}%`);
        
        // Create new record
        const { error: insertError } = await supabase
          .from('user_course_progress')
          .insert({
            user_id: userId,
            course_id: courseId,
            progress_percentage: progressPercentage,
            started_at: now,
            completed: isCompleted,
            completed_at: isCompleted ? now : null
          });
        
        if (insertError) {
          console.error("ProgressService: Error creating course progress:", insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("ProgressService: Error updating course progress:", error);
      return false;
    }
  };

  return {
    markLessonAsCompleted,
    getLessonProgress,
    isLoading
  };
}
