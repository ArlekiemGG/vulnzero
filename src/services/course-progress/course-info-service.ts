
import { supabase } from '@/integrations/supabase/client';
import { normalizeId } from '@/utils/uuid-generator';

/**
 * Service for retrieving course information
 */
export const courseInfoService = {
  /**
   * Obtiene información del curso al que pertenece una lección
   */
  getLessonCourseInfo: async (lessonId: string) => {
    try {
      // Normalizar el ID de lección a UUID
      const normalizedLessonId = normalizeId(lessonId);
      console.log(`courseInfoService: Getting course info for lesson ${lessonId} (normalized: ${normalizedLessonId})`);
      
      const { data, error } = await supabase
        .from('course_lessons')
        .select(`
          section_id,
          course_sections (
            course_id
          )
        `)
        .eq('id', normalizedLessonId)
        .single();
      
      if (error) {
        console.error("courseInfoService: Error getting lesson course info:", error);
        throw error;
      }
      
      console.log(`courseInfoService: Found course info for lesson:`, data);
      return { data };
    } catch (error) {
      console.error('Error in getLessonCourseInfo:', error);
      return { data: null };
    }
  },
  
  /**
   * Obtiene el progreso de un curso específico para un usuario
   */
  getCourseProgress: async (userId: string, courseId: string) => {
    try {
      const normalizedCourseId = normalizeId(courseId);
      
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error in getCourseProgress:', error);
      return { data: null, error };
    }
  }
};
