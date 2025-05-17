
import { supabase } from '@/integrations/supabase/client';
import { normalizeId } from '@/utils/uuid-generator';

/**
 * Service for updating course progress
 */
export const courseProgressUpdater = {
  /**
   * Actualiza los datos de progreso del curso
   */
  updateCourseProgressData: async (userId: string, courseId: string): Promise<boolean> => {
    try {
      // Normalizar ID del curso
      const normalizedCourseId = normalizeId(courseId);
      
      // 1. Ensure all records have the correct course_id
      try {
        const { error } = await supabase.rpc('update_lesson_progress_course_id');
        
        if (error) {
          console.error("Error updating lesson progress course IDs:", error);
        }
      } catch (error) {
        console.error("Error calling update_lesson_progress_course_id:", error);
      }
      
      // 2. Count total lessons
      const sectionsSubquery = supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', normalizedCourseId);
      
      const { data: sectionData } = await sectionsSubquery;
      const sectionIds = sectionData ? sectionData.map(section => section.id) : [];
      
      if (sectionIds.length === 0) {
        return false;
      }
      
      const { count, error: countError } = await supabase
        .from('course_lessons')
        .select('id', { count: 'exact', head: true })
        .in('section_id', sectionIds);
      
      if (countError) {
        throw countError;
      }
      
      const totalLessons = count || 0;
      
      // 3. Count completed lessons
      const { data: completedLessons, error: completedError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .eq('completed', true);
      
      if (completedError) {
        throw completedError;
      }
      
      const completedCount = completedLessons?.length || 0;
      
      // 4. Calculate progress percentage
      const progressPercentage = totalLessons > 0 
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;
      
      const isCompleted = totalLessons > 0 && completedCount >= totalLessons;
      
      // 5. Update or create course progress record
      const now = new Date().toISOString();
      
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .maybeSingle();
      
      if (checkError) {
        throw checkError;
      }
      
      if (existingProgress) {
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
          throw updateError;
        }
      } else {
        // Create new record
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
          throw insertError;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateCourseProgressData:', error);
      return false;
    }
  }
};
