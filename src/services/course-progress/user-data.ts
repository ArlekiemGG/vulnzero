
import { ProgressResult } from './types';
import * as queries from './queries';

/**
 * Obtiene los datos de progreso del usuario para un curso específico
 */
export async function fetchUserProgressData(courseId: string, userId: string): Promise<ProgressResult> {
  try {
    // Fetch course progress data
    const { data: progressData, error: progressError } = await queries.getCourseProgress(userId, courseId);
    if (progressError) {
      console.error("Error fetching course progress:", progressError);
      // Fallback para evitar errores si no hay progreso
      return {
        progress: 0,
        completedLessons: {},
        completedQuizzes: {}
      };
    }

    // Fetch lesson progress data
    const { data: lessonProgressData, error: lessonProgressError } = await queries.getLessonProgress(userId, courseId);
    if (lessonProgressError) {
      console.error("Error fetching lesson progress:", lessonProgressError);
      // Fallback para evitar errores si no hay progreso de lecciones
      return {
        progress: progressData?.progress_percentage || 0,
        completedLessons: {},
        completedQuizzes: {}
      };
    }
    
    // Process and set data
    const progress = progressData?.progress_percentage || 0;
    const completedLessonsMap: Record<string, boolean> = {};
    const completedQuizzesMap: Record<string, boolean> = {};
    
    if (lessonProgressData && Array.isArray(lessonProgressData)) {
      lessonProgressData.forEach((item: { lesson_id: string; completed: boolean }) => {
        if (item && item.completed) {
          // Crear clave estandarizada: courseId:lessonId
          completedLessonsMap[`${courseId}:${item.lesson_id}`] = true;
        }
      });
    }

    return {
      progress,
      completedLessons: completedLessonsMap,
      completedQuizzes: completedQuizzesMap
    };
  } catch (error) {
    console.error("Error in fetchUserProgressData:", error);
    // Fallback para cualquier error no controlado
    return {
      progress: 0,
      completedLessons: {},
      completedQuizzes: {}
    };
  }
}
