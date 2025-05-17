
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { normalizeId, isValidUUID } from '@/utils/uuid-generator';
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
      let lessonIdToUse = lessonId;
      
      // Try to determine if this is a UUID or not
      if (isValidUUID(lessonId)) {
        console.log(`ProgressService: Lesson ID ${lessonId} is already in UUID format`);
      } else {
        // If not a UUID, we need to try both the original ID and a normalized version
        const normalizedLessonId = normalizeId(lessonId);
        console.log(`ProgressService: Non-UUID lesson ID detected. Original: ${lessonId}, Normalized: ${normalizedLessonId}`);
        
        // Try with normalized ID first
        const { data: normalizedData } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', userContext.user.id)
          .eq('lesson_id', normalizedLessonId)
          .maybeSingle();
        
        if (normalizedData) {
          console.log(`ProgressService: Found progress with normalized ID`);
          return normalizedData;
        }
      }
      
      // If not found with normalized ID or if the original ID was already a UUID, try with original ID
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
      
      // Determine if the courseId and lessonId are already UUIDs
      const isValidCourseId = isValidUUID(courseId);
      const isValidLessonId = isValidUUID(lessonId);
      
      // Normalize IDs if they're not already UUIDs
      const normalizedCourseId = isValidCourseId ? courseId : normalizeId(courseId);
      const normalizedLessonId = isValidLessonId ? lessonId : normalizeId(lessonId);
      
      console.log(`ProgressService: Course ID: ${courseId} (valid UUID: ${isValidCourseId}, normalized: ${normalizedCourseId})`);
      console.log(`ProgressService: Lesson ID: ${lessonId} (valid UUID: ${isValidLessonId}, normalized: ${normalizedLessonId})`);
      
      // We'll try a two-pronged approach:
      // 1. First, try to use the courseProgressService (which might have better handling for non-UUID IDs)
      // 2. If that fails, fall back to direct database access with careful ID handling
      
      // First approach: Use courseProgressService
      console.log(`ProgressService: Using courseProgressService first...`);
      try {
        const serviceSuccess = await courseProgressService.markLessonComplete(
          userContext.user.id, 
          normalizedCourseId,
          lessonId // Use original lessonId as the service may handle normalization internally
        );
        
        if (serviceSuccess) {
          console.log(`ProgressService: courseProgressService completed successfully`);
          await refreshUserStats();
          setIsLoading(false);
          return true;
        }
        
        console.log(`ProgressService: courseProgressService didn't report success, falling back to direct method`);
      } catch (serviceError) {
        console.error('ProgressService: Error using courseProgressService:', serviceError);
        console.log(`ProgressService: Falling back to direct method`);
      }
      
      // Second approach: Direct database access
      console.log(`ProgressService: Using direct database access...`);
      
      // IMPORTANT: For direct access, we need to be very careful with ID formats
      // The database expects UUID format for user_id and expects consistency for lesson_id
      
      // Strategy:
      // 1. Try using the original lessonId first (might be a UUID or might be a string ID)
      // 2. If that fails due to UUID validation error, try using the normalized version
      
      // Check if a record already exists with the original lessonId
      const { data: existingProgress, error: lookupError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userContext.user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (lookupError && lookupError.message.includes('invalid input syntax for type uuid')) {
        console.log(`ProgressService: UUID error with original lessonId, switching to normalized ID`);
        // If we got a UUID error, we need to use the normalized version
        return await updateProgressWithNormalizedId(normalizedLessonId, normalizedCourseId);
      }
      
      const now = new Date().toISOString();
      
      if (existingProgress) {
        console.log(`ProgressService: Updating existing progress record ${existingProgress.id} with original lessonId`);
        
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
      } else {
        console.log(`ProgressService: Creating new progress record with original lessonId`);
        
        try {
          // Create new record with original lessonId
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
            if (insertError.message.includes('invalid input syntax for type uuid')) {
              console.log(`ProgressService: UUID error during insert, switching to normalized ID`);
              // If we got a UUID error, we need to use the normalized version
              return await updateProgressWithNormalizedId(normalizedLessonId, normalizedCourseId);
            } else {
              console.error("ProgressService: Error creating lesson progress:", insertError);
              throw insertError;
            }
          }
        } catch (insertError: any) {
          if (insertError.message && insertError.message.includes('invalid input syntax for type uuid')) {
            console.log(`ProgressService: Caught UUID error during insert, switching to normalized ID`);
            // If we got a UUID error, we need to use the normalized version
            return await updateProgressWithNormalizedId(normalizedLessonId, normalizedCourseId);
          } else {
            console.error("ProgressService: Error in insert operation:", insertError);
            throw insertError;
          }
        }
      }

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
  
  // Helper function to update progress with normalized IDs when original IDs fail
  const updateProgressWithNormalizedId = async (normalizedLessonId: string, normalizedCourseId: string) => {
    try {
      console.log(`ProgressService: Attempting operation with normalized lessonId ${normalizedLessonId}`);
      
      const now = new Date().toISOString();
      
      // Check if a record already exists with the normalized lessonId
      const { data: existingProgress } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userContext.user!.id)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
      
      if (existingProgress) {
        console.log(`ProgressService: Updating existing progress record ${existingProgress.id} with normalized lessonId`);
        
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
          console.error("ProgressService: Error updating lesson progress with normalized ID:", updateError);
          throw updateError;
        }
      } else {
        console.log(`ProgressService: Creating new progress record with normalized lessonId`);
        
        // Create new record with normalized lessonId
        const { error: insertError } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: userContext.user!.id,
            lesson_id: normalizedLessonId,
            course_id: normalizedCourseId,
            completed: true,
            completed_at: now
          });
        
        if (insertError) {
          console.error("ProgressService: Error creating lesson progress with normalized ID:", insertError);
          throw insertError;
        }
      }
      
      // Update course progress
      await updateCourseProgress(userContext.user!.id, normalizedCourseId);
      
      // Log user activity
      try {
        await supabase.rpc('log_user_activity', {
          p_user_id: userContext.user!.id,
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
      
      return true;
    } catch (error) {
      console.error("ProgressService: Error in updateProgressWithNormalizedId:", error);
      throw error;
    }
  };
  
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
