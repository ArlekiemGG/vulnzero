
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { generateUUID, isValidUUID, normalizeId, safelyHandleDbId } from '@/utils/uuid-generator';
import { LessonProgressItem, SimpleLessonProgress } from '@/types/course-progress';
import { courseProgressUpdater } from './course-progress-updater';

/**
 * Service for managing lesson progress
 */
export const lessonProgressService = {
  /**
   * Obtiene el progreso específico de una lección
   */
  fetchLessonProgressByLessonId: async (userId: string, lessonId: string) => {
    try {
      // Normalizamos el ID de lección a UUID si es posible
      const normalizedLessonId = isValidUUID(lessonId) ? lessonId : normalizeId(lessonId);
      console.log(`LessonProgressService: Checking progress for lesson ${lessonId} (normalized: ${normalizedLessonId})`);
      
      // First try with normalized ID
      const { data: normalizedData, error: normalizedError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
        
      // If found with normalized ID, return it
      if (normalizedData) {
        return { data: normalizedData };
      }
      
      // If not found with normalized ID, try with original ID
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
        throw error;
      }
      
      return { data };
    } catch (error) {
      console.error('Error in fetchLessonProgressByLessonId:', error);
      return { data: null };
    }
  },

  /**
   * Marca una lección como completada
   */
  markLessonComplete: async (userId: string, courseId: string, lessonId: string): Promise<boolean> => {
    try {
      console.log(`LessonProgressService: Marking lesson ${lessonId} as completed for course ${courseId}`);
      
      // Normalizamos el courseId siempre a UUID
      const normalizedCourseId = normalizeId(courseId);
      console.log(`LessonProgressService: Normalized courseId from ${courseId} to ${normalizedCourseId}`);
      
      // Para el ID de la lección, intentaremos verificar si existe en la tabla course_lessons
      const { data: existingLesson, error: lessonCheckError } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('id', normalizeId(lessonId))
        .maybeSingle();
        
      if (lessonCheckError && lessonCheckError.code !== 'PGRST116') { // Ignore "no rows returned" error
        console.error("Error checking if lesson exists:", lessonCheckError);
      }
      
      // Decide which lessonId to use: 
      // - If the lesson exists in DB, use normalized UUID
      // - If it doesn't exist (static content), use the original ID
      const lessonIdToUse = existingLesson ? normalizeId(lessonId) : lessonId;
      
      console.log(`LessonProgressService: Using lessonId ${lessonIdToUse} (original: ${lessonId})`);
      
      // Check for existing progress using the chosen lessonId
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonIdToUse)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') { // Ignore "no rows returned" error
        throw checkError;
      }
      
      const now = new Date().toISOString();
      
      if (existingProgress) {
        console.log(`LessonProgressService: Updating existing progress record ${existingProgress.id}`);
        
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
          console.error("Error updating lesson progress:", updateError);
          return false;
        }
      } else {
        console.log(`LessonProgressService: Creating new progress record`);
        
        try {
          // Create new record
          const { error: insertError } = await supabase
            .from('user_lesson_progress')
            .insert({
              user_id: userId,
              lesson_id: lessonIdToUse,
              course_id: normalizedCourseId,
              completed: true,
              completed_at: now
            });
          
          if (insertError) {
            console.error("Error creating lesson progress:", insertError);
            
            // If we get a UUID error, try an alternative approach
            if (insertError.message && insertError.message.includes('invalid input syntax for type uuid')) {
              console.log("Attempting alternative approach with direct RPC call");
              
              // Use an RPC call that can handle the string ID properly
              const { data: rpcResult, error: rpcError } = await supabase.rpc('create_lesson_progress', {
                p_user_id: userId,
                p_lesson_id: lessonId, // Use original ID here
                p_course_id: normalizedCourseId,
                p_completed: true
              });
              
              if (rpcError) {
                console.error("RPC error:", rpcError);
                return false;
              }
              
              return !!rpcResult;
            }
            
            return false;
          }
        } catch (insertError: any) {
          console.error("Caught exception in insert operation:", insertError);
          return false;
        }
      }
      
      // Update course progress
      try {
        await courseProgressUpdater.updateCourseProgressData(userId, normalizedCourseId);
      } catch (updateError) {
        console.error("Error updating course progress data:", updateError);
        // Don't fail the operation if this fails
      }
      
      // Log activity
      try {
        await supabase.rpc('log_user_activity', {
          p_user_id: userId,
          p_type: 'lesson_completion',
          p_title: `Completó una lección del curso`,
          p_points: 10
        });
      } catch (activityError) {
        console.error("Error logging activity:", activityError);
        // Don't fail the operation if this fails
      }
      
      return true;
    } catch (error) {
      console.error("Error in markLessonComplete:", error);
      return false;
    }
  },

  /**
   * Guarda los resultados de un quiz
   */
  saveQuizResults: async (
    userId: string, 
    courseId: string, 
    lessonId: string, 
    score: number, 
    answers: Record<string, number>
  ): Promise<boolean> => {
    try {
      // Normalizamos IDs a UUID
      const normalizedCourseId = normalizeId(courseId);
      
      // Para el ID de la lección, intentaremos verificar si existe en la tabla course_lessons
      const { data: existingLesson, error: lessonCheckError } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('id', normalizeId(lessonId))
        .maybeSingle();
        
      if (lessonCheckError && lessonCheckError.code !== 'PGRST116') { // Ignore "no rows returned" error
        console.error("Error checking if lesson exists:", lessonCheckError);
      }
      
      // Si la lección no existe en la tabla course_lessons
      // almacenamos el progreso usando el ID original sin normalizar
      const lessonIdToUse = existingLesson ? normalizeId(lessonId) : lessonId;
      
      // Check for existing progress
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonIdToUse)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') { // Ignore "no rows returned" error
        throw checkError;
      }
      
      const now = new Date().toISOString();
      const quizData = {
        completed: true,
        completed_at: now,
        course_id: normalizedCourseId,
        quiz_score: score,
        quiz_answers: answers
      };
      
      if (existingProgress) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_lesson_progress')
          .update(quizData)
          .eq('id', existingProgress.id);
        
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: userId,
            lesson_id: lessonIdToUse,
            ...quizData
          });
        
        if (insertError) {
          throw insertError;
        }
      }
      
      // Update course progress
      await courseProgressUpdater.updateCourseProgressData(userId, normalizedCourseId);
      
      // Log activity
      const pointsEarned = Math.round(score / 10);
      
      try {
        await supabase.rpc('log_user_activity', {
          p_user_id: userId,
          p_type: 'quiz_completion',
          p_title: `Completó un quiz con ${score}% de acierto`,
          p_points: pointsEarned
        });
      } catch (activityError) {
        console.error("Error logging quiz activity:", activityError);
      }
      
      return true;
    } catch (error) {
      console.error('Error in saveQuizResults:', error);
      return false;
    }
  }
};
