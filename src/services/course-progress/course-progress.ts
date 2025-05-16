
import { CourseProgressItem } from './types';
import * as queries from './queries';

/**
 * Actualiza los datos de progreso del curso basados en lecciones completadas
 */
export async function updateCourseProgressData(userId: string, courseId: string): Promise<boolean> {
  try {
    // Contar lecciones totales y completadas
    const { data: totalLessonsData, error: countError } = await queries.countTotalLessons(courseId);
    if (countError) {
      console.error("Error counting total lessons:", countError);
      return false;
    }

    const { data: completedLessonsData, error: completedError } = await queries.countCompletedLessons(userId, courseId);
    if (completedError) {
      console.error("Error counting completed lessons:", completedError);
      return false;
    }

    const totalLessons = totalLessonsData?.count || 0;
    const completedLessons = completedLessonsData?.length || 0;

    // Calcular porcentaje de progreso
    const progressPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    // Determinar si el curso está completo
    const isCompleted = totalLessons > 0 && completedLessons >= totalLessons;
    const now = new Date().toISOString();

    // Verificar si ya existe un registro para este curso
    const { data: existingProgress, error: checkError } = await queries.checkCourseProgressExists(userId, courseId);
    if (checkError) {
      console.error("Error checking course progress:", checkError);
      return false;
    }

    if (existingProgress?.id) {
      // Actualizar registro existente
      const { error: updateError } = await queries.updateCourseProgressRecord(
        existingProgress.id,
        {
          progress_percentage: progressPercentage,
          completed: isCompleted,
          completed_at: isCompleted ? now : null,
          // No actualizamos started_at para mantener la fecha original
        }
      );

      if (updateError) {
        console.error("Error updating course progress:", updateError);
        return false;
      }
    } else {
      // Crear nuevo registro
      const newProgress: CourseProgressItem = {
        user_id: userId,
        course_id: courseId,
        progress_percentage: progressPercentage,
        started_at: now,
        completed: isCompleted,
        completed_at: isCompleted ? now : null
      };

      const { error: insertError } = await queries.createCourseProgressRecord(newProgress);

      if (insertError) {
        console.error("Error creating course progress:", insertError);
        return false;
      }
    }

    console.log(`Course progress updated: ${courseId}, User: ${userId}, Progress: ${progressPercentage}%, Completed: ${isCompleted}`);
    return true;
  } catch (error) {
    console.error("Error in updateCourseProgressData:", error);
    return false;
  }
}
