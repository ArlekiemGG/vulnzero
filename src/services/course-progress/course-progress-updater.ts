
import { supabase } from '@/integrations/supabase/client';
import { normalizeId, isValidUUID } from '@/utils/uuid-generator';

/**
 * Service for updating course progress
 */
export const courseProgressUpdater = {
  /**
   * Actualiza los datos de progreso del curso
   */
  updateCourseProgressData: async (userId: string, courseId: string): Promise<boolean> => {
    try {
      // Asegurarse de que el courseId es un UUID válido
      const normalizedCourseId = isValidUUID(courseId) ? courseId : normalizeId(courseId);
      
      console.log(`updateCourseProgressData: Updating progress for course ${courseId} (normalized: ${normalizedCourseId})`);
      
      // 1. Ensure all records have the correct course_id
      try {
        const { error } = await supabase.rpc('update_lesson_progress_course_id');
        
        if (error) {
          console.error("Error updating lesson progress course IDs:", error);
        }
      } catch (error) {
        console.error("Error calling update_lesson_progress_course_id:", error);
        // Continue the process even if this fails
      }
      
      // 2. Count total lessons
      const sectionsSubquery = supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', normalizedCourseId);
      
      const { data: sectionData, error: sectionError } = await sectionsSubquery;
      
      if (sectionError && sectionError.code !== 'PGRST116') { // Ignore "no rows returned" error
        console.error("Error getting sections:", sectionError);
        return false;
      }
      
      const sectionIds = sectionData ? sectionData.map(section => section.id) : [];
      
      let totalLessons = 0;
      
      if (sectionIds.length > 0) {
        const { count, error: countError } = await supabase
          .from('course_lessons')
          .select('id', { count: 'exact', head: true })
          .in('section_id', sectionIds);
        
        if (countError && countError.code !== 'PGRST116') { // Ignore "no rows returned" error
          console.error("Error counting lessons:", countError);
          return false;
        }
        
        totalLessons = count || 0;
      }
      
      // 3. Count completed lessons using both normalized and original courseId
      let completedLessons = [];
      
      // First try with normalized ID
      const { data: normalizedCompleted, error: normalizedError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .eq('completed', true);
        
      if (normalizedError && normalizedError.code !== 'PGRST116') { // Ignore "no rows returned" error
        console.error("Error counting completed lessons (normalized):", normalizedError);
        return false;
      }
      
      completedLessons = normalizedCompleted || [];
      
      // If courseId is different from normalizedCourseId, also check with original ID
      if (courseId !== normalizedCourseId) {
        const { data: originalCompleted, error: originalError } = await supabase
          .from('user_lesson_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .eq('completed', true);
          
        if (originalError && originalError.code !== 'PGRST116') { // Ignore "no rows returned" error
          console.error("Error counting completed lessons (original):", originalError);
          return false;
        }
        
        if (originalCompleted && originalCompleted.length > 0) {
          completedLessons = [...completedLessons, ...originalCompleted];
        }
      }
      
      const completedCount = completedLessons.length;
      
      // 4. Calculate progress percentage
      let progressPercentage = 0;
      let isCompleted = false;
      
      if (totalLessons > 0) {
        progressPercentage = Math.round((completedCount / totalLessons) * 100);
        isCompleted = completedCount >= totalLessons;
      } else if (completedCount > 0) {
        // Si no hay lecciones registradas pero hay progreso, consideramos el curso como completado
        progressPercentage = 100;
        isCompleted = true;
      }
      
      // 5. Update or create course progress record
      const now = new Date().toISOString();
      
      // Check if progress record exists with normalized courseId
      const { data: existingNormalizedProgress, error: normalizedCheckError } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .maybeSingle();
      
      if (normalizedCheckError && normalizedCheckError.code !== 'PGRST116') { // Ignore "no rows returned" error
        console.error("Error checking for existing progress (normalized):", normalizedCheckError);
        return false;
      }
      
      // Check if progress record exists with original courseId
      let existingOriginalProgress = null;
      if (courseId !== normalizedCourseId) {
        const { data: origProgress, error: origCheckError } = await supabase
          .from('user_course_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle();
        
        if (origCheckError && origCheckError.code !== 'PGRST116') { // Ignore "no rows returned" error
          console.error("Error checking for existing progress (original):", origCheckError);
          return false;
        }
        
        existingOriginalProgress = origProgress;
      }
      
      const progressUpdateData = {
        progress_percentage: progressPercentage,
        completed: isCompleted,
        completed_at: isCompleted ? now : null
      };
      
      if (existingNormalizedProgress) {
        // Update existing record with normalized course ID
        const { error: updateError } = await supabase
          .from('user_course_progress')
          .update(progressUpdateData)
          .eq('id', existingNormalizedProgress.id);
        
        if (updateError) {
          console.error("Error updating course progress:", updateError);
          return false;
        }
        
        // If there's also a record with original course ID, update that too
        if (existingOriginalProgress) {
          const { error: updateOrigError } = await supabase
            .from('user_course_progress')
            .update(progressUpdateData)
            .eq('id', existingOriginalProgress.id);
          
          if (updateOrigError) {
            console.error("Error updating course progress (original):", updateOrigError);
          }
        }
      } else if (existingOriginalProgress) {
        // Update existing record with original course ID
        const { error: updateOrigError } = await supabase
          .from('user_course_progress')
          .update(progressUpdateData)
          .eq('id', existingOriginalProgress.id);
        
        if (updateOrigError) {
          console.error("Error updating course progress (original):", updateOrigError);
          return false;
        }
      } else {
        // Create new record with normalized course ID
        const { error: insertError } = await supabase
          .from('user_course_progress')
          .insert({
            user_id: userId,
            course_id: normalizedCourseId,
            progress_percentage: progressPercentage,
            started_at: now,
            completed: isCompleted,
            completed_at: isCompleted ? now : null
          });
        
        if (insertError) {
          console.error("Error creating course progress:", insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateCourseProgressData:', error);
      return false;
    }
  }
};
