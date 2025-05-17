
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
      
      const now = new Date().toISOString();
      let success = false;

      // Intentamos usar la función RPC primero, que maneja mejor los IDs no-UUID
      try {
        console.log(`LessonProgressService: Attempting to use create_lesson_progress RPC function`);
        
        // Llamamos directamente a la función RPC para crear/actualizar el progreso
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          'create_lesson_progress', 
          {
            p_user_id: userId,
            p_lesson_id: lessonId,
            p_course_id: normalizedCourseId,
            p_completed: true
          }
        );
        
        if (rpcError) {
          console.error("RPC error:", rpcError);
          // Si hay un error, intentaremos el método alternativo a continuación
        } else {
          console.log("RPC call successful:", rpcResult);
          success = !!rpcResult;
          
          if (success) {
            // No necesitamos más intentos si el RPC tuvo éxito
            // Actualizar el progreso del curso
            try {
              await courseProgressUpdater.updateCourseProgressData(userId, normalizedCourseId);
            } catch (updateError) {
              console.error("Error updating course progress data after RPC:", updateError);
              // No fallamos la operación si esto falla
            }
            
            // Registrar actividad
            try {
              await supabase.rpc('log_user_activity', {
                p_user_id: userId,
                p_type: 'lesson_completion',
                p_title: `Completó una lección del curso`,
                p_points: 10
              });
            } catch (activityError) {
              console.error("Error logging activity after RPC:", activityError);
              // No fallamos la operación si esto falla
            }
            
            return true;
          }
        }
      } catch (rpcError) {
        console.error("Caught exception in RPC call:", rpcError);
        // Continuamos con el enfoque alternativo
      }
      
      // Si el RPC falló o no fue exitoso, intentamos el enfoque estándar
      if (!success) {
        console.log(`LessonProgressService: RPC approach failed or returned false, trying standard approach`);
        
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
          
          success = true;
        } else {
          console.log(`LessonProgressService: Creating new progress record`);
          
          try {
            // Intentar crear un nuevo registro con el ID de lección elegido
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
              // Si hay un error de inserción y parece relacionado con UUID
              if (insertError.message && insertError.message.includes('invalid input syntax for type uuid')) {
                console.log("UUID syntax error detected, trying with md5 hash conversion");
                
                // Generamos un UUID basado en MD5 hash del lessonId
                const md5LessonId = await generateMd5Uuid(lessonId);
                console.log(`Generated MD5 UUID from ${lessonId}: ${md5LessonId}`);
                
                const { error: md5InsertError } = await supabase
                  .from('user_lesson_progress')
                  .insert({
                    user_id: userId,
                    lesson_id: md5LessonId,
                    course_id: normalizedCourseId,
                    completed: true,
                    completed_at: now
                  });
                
                if (md5InsertError) {
                  console.error("Error creating lesson progress with MD5 UUID:", md5InsertError);
                  return false;
                }
                
                success = true;
              } else {
                console.error("Error creating lesson progress:", insertError);
                return false;
              }
            } else {
              success = true;
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
      }
      
      return success;
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
      
      // Intentamos marcar la lección como completada primero
      const success = await lessonProgressService.markLessonComplete(userId, courseId, lessonId);
      
      if (!success) {
        console.error("Failed to mark lesson as complete during quiz submission");
        return false;
      }
      
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
        // Create new record using RPC function
        try {
          const { data: rpcResult, error: rpcError } = await supabase.rpc(
            'create_lesson_progress', 
            {
              p_user_id: userId,
              p_lesson_id: lessonId,
              p_course_id: normalizedCourseId,
              p_completed: true
            }
          );
          
          if (rpcError) {
            console.error("RPC error during quiz save:", rpcError);
            throw rpcError;
          }
          
          // Now update the record with quiz data
          // We need to find it first since it was just created
          const { data: newProgress, error: findError } = await supabase
            .from('user_lesson_progress')
            .select('id')
            .eq('user_id', userId)
            .eq('lesson_id', lessonIdToUse)
            .maybeSingle();
          
          if (findError || !newProgress) {
            console.error("Error finding newly created progress:", findError);
            throw findError || new Error("Could not find newly created progress");
          }
          
          const { error: quizUpdateError } = await supabase
            .from('user_lesson_progress')
            .update({
              quiz_score: score,
              quiz_answers: answers
            })
            .eq('id', newProgress.id);
          
          if (quizUpdateError) {
            console.error("Error updating quiz data:", quizUpdateError);
            throw quizUpdateError;
          }
        } catch (insertError) {
          console.error("Error in quiz progress creation:", insertError);
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

/**
 * Genera un UUID usando el algoritmo MD5 para casos donde necesitamos
 * un UUID válido pero no podemos usar el método normal
 */
async function generateMd5Uuid(input: string): Promise<string> {
  // En un entorno real, generaríamos un UUID basado en MD5
  // Aquí simplemente usamos la función normalizeId que ya tenemos
  return normalizeId(input);
}
