
import { LessonProgressItem } from './types';
import * as queries from './queries';
import { updateCourseProgressData } from './course-progress';

/**
 * Marca una lección como completa y actualiza el progreso del curso
 */
export async function markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<boolean> {
  try {
    console.log(`markLessonComplete: Processing lesson ${lessonId} for course ${courseId} and user ${userId}`);
    
    // Verificar si ya existe un registro para esta lección
    const { data: existingProgress, error: checkError } = await queries.checkLessonProgressExists(
      userId, 
      courseId, 
      lessonId
    );

    if (checkError) {
      console.error("Error checking lesson progress:", checkError);
      return false;
    }

    const now = new Date().toISOString();
    let success = false;

    if (existingProgress?.id) {
      console.log(`markLessonComplete: Updating existing progress record ${existingProgress.id}`);
      
      // Actualizar registro existente
      const { error: updateError } = await queries.updateLessonProgress(
        existingProgress.id, 
        {
          completed: true,
          completed_at: now
        }
      );

      if (updateError) {
        console.error("Error updating lesson progress:", updateError);
        return false;
      }

      success = true;
    } else {
      console.log(`markLessonComplete: Creating new progress record for lesson ${lessonId}`);
      
      // Crear nuevo registro
      const newProgress: LessonProgressItem = {
        id: '', // Generado por Supabase
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        completed: true,
        completed_at: now
      };

      const { error: insertError } = await queries.createLessonProgress(newProgress);

      if (insertError) {
        console.error("Error creating lesson progress:", insertError);
        return false;
      }
      
      success = true;
    }

    // Actualizar el progreso del curso
    if (success) {
      console.log(`markLessonComplete: Updating course progress data for course ${courseId}`);
      const courseUpdateResult = await updateCourseProgressData(userId, courseId);
      console.log(`markLessonComplete: Course progress update result: ${courseUpdateResult}`);
    }

    return success;
  } catch (error) {
    console.error("Error in markLessonComplete:", error);
    return false;
  }
}

/**
 * Guarda los resultados de un quiz y marca la lección como completa
 */
export async function saveQuizResults(
  userId: string, 
  courseId: string, 
  lessonId: string, 
  score: number, 
  answers: Record<string, number>
): Promise<boolean> {
  try {
    console.log(`saveQuizResults: Processing quiz for lesson ${lessonId}, course ${courseId}, user ${userId}`);
    
    // Primero marcamos la lección como completa
    const success = await markLessonComplete(userId, courseId, lessonId);
    
    if (success) {
      // TODO: Si se necesita almacenar los resultados del quiz en una tabla separada
      console.log(`Quiz results for user ${userId}, lesson ${lessonId}: Score ${score}`);
      
      // Aquí podríamos guardar los resultados del quiz en una tabla específica
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in saveQuizResults:", error);
    return false;
  }
}
