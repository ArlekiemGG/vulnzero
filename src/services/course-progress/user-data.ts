
import { ProgressResult } from './types';
import * as queries from './queries';

/**
 * Retrieves user progress data for a specific course
 */
export async function fetchUserProgressData(courseId: string, userId: string): Promise<ProgressResult> {
  try {
    // Get course progress data
    const { data: progressData, error: progressError } = await queries.getCourseProgress(userId, courseId);
    if (progressError) {
      console.error("Error fetching course progress:", progressError);
      return {
        progress: 0,
        completedLessons: {},
        completedQuizzes: {}
      };
    }

    // Get lesson progress data with course_id filter
    const { data: lessonProgressData, error: lessonProgressError } = await queries.getLessonProgress(userId, courseId);
    if (lessonProgressError) {
      console.error("Error fetching lesson progress:", lessonProgressError);
      return {
        progress: progressData?.progress_percentage || 0,
        completedLessons: {},
        completedQuizzes: {}
      };
    }
    
    // Process response data
    const progress = progressData?.progress_percentage || 0;
    const completedLessonsMap: Record<string, boolean> = {};
    const completedQuizzesMap: Record<string, boolean> = {};
    
    if (lessonProgressData && Array.isArray(lessonProgressData)) {
      lessonProgressData.forEach((item) => {
        if (item && item.completed) {
          // Crear clave estandarizada: courseId:lessonId  
          const lessonKey = `${courseId}:${item.lesson_id}`;
          completedLessonsMap[lessonKey] = true;

          // Para compatibilidad también mantenemos el formato más general
          completedLessonsMap[item.lesson_id] = true;
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
    return {
      progress: 0,
      completedLessons: {},
      completedQuizzes: {}
    };
  }
}
