
import { ProgressResult, QuizResult } from './types';
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
          // Crear clave combinada para completedLessons usando courseId y lessonId
          const lessonKey = `${courseId}:${item.lesson_id}`;
          completedLessonsMap[lessonKey] = true;
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

/**
 * Marca una lección como completada
 */
export async function markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<boolean> {
  try {
    // Check if the lesson is already marked as completed
    const { data: existingProgress, error: checkError } = await queries.checkLessonProgressExists(userId, courseId, lessonId);
    
    if (checkError) {
      throw new Error(`Error checking lesson progress: ${checkError.message}`);
    }
    
    if (existingProgress) {
      // Update existing record
      const { error } = await queries.updateLessonProgress(existingProgress.id, {
        completed: true,
        completed_at: new Date().toISOString()
      });
      
      if (error) throw new Error(`Error updating lesson progress: ${error.message}`);
    } else {
      // Create new record with all required fields
      const { error } = await queries.createLessonProgress({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString()
      });
      
      if (error) throw new Error(`Error creating lesson progress: ${error.message}`);
    }
    
    // Update course progress
    await updateCourseProgressData(userId, courseId);
    
    return true;
  } catch (error) {
    console.error("Error in markLessonComplete:", error);
    return false;
  }
}

/**
 * Guarda los resultados de un quiz y marca la lección como completada
 */
export async function saveQuizResults(
  userId: string, 
  courseId: string, 
  lessonId: string, 
  score: number, 
  answers: Record<string, number>
): Promise<boolean> {
  try {
    // Check if lesson progress already exists
    const { data: existingLesson, error: checkError } = await queries.checkLessonProgressExists(userId, courseId, lessonId);
    
    if (checkError) {
      throw new Error(`Error checking lesson progress: ${checkError.message}`);
    }
    
    const lessonData = {
      completed: true,
      completed_at: new Date().toISOString()
    };
    
    if (existingLesson) {
      // Update existing record
      const { error } = await queries.updateLessonProgress(existingLesson.id, lessonData);
      if (error) throw new Error(`Error updating lesson progress: ${error.message}`);
    } else {
      // Create new lesson progress record with all required fields
      const { error } = await queries.createLessonProgress({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        ...lessonData
      });
      
      if (error) throw new Error(`Error creating lesson progress: ${error.message}`);
    }
    
    // Update course progress
    await updateCourseProgressData(userId, courseId);
    
    return true;
  } catch (error) {
    console.error("Error in saveQuizResults:", error);
    return false;
  }
}

/**
 * Actualiza los datos de progreso del curso
 */
export async function updateCourseProgressData(userId: string, courseId: string): Promise<number> {
  try {
    // Get total lessons count
    const { count: totalLessonsCount, error: totalLessonsError } = await queries.countTotalLessons(courseId);
    
    if (totalLessonsError) {
      throw new Error(`Error counting total lessons: ${totalLessonsError.message}`);
    }
    
    // Get completed lessons count
    const { data: completedLessonsData, error: completedLessonsError } = await queries.countCompletedLessons(userId, courseId);
    
    if (completedLessonsError) {
      throw new Error(`Error counting completed lessons: ${completedLessonsError.message}`);
    }
    
    const totalLessons = totalLessonsCount || 0;
    const completedCount = completedLessonsData?.length || 0;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const completed = progressPercentage === 100;
    
    // Check if course progress record exists
    const { data: existingProgress, error: checkError } = await queries.checkCourseProgressExists(userId, courseId);
    
    if (checkError) {
      throw new Error(`Error checking course progress: ${checkError.message}`);
    }
    
    const updateData = {
      progress_percentage: progressPercentage,
      completed,
      completed_at: completed ? new Date().toISOString() : null
    };
    
    if (existingProgress) {
      // Update existing record
      const { error } = await queries.updateCourseProgressRecord(existingProgress.id, updateData);
      if (error) throw new Error(`Error updating course progress: ${error.message}`);
    } else {
      // Create new record with all required fields
      const { error } = await queries.createCourseProgressRecord({
        user_id: userId,
        course_id: courseId,
        ...updateData,
        started_at: new Date().toISOString(),
        progress_percentage: progressPercentage
      });
      if (error) throw new Error(`Error creating course progress: ${error.message}`);
    }
    
    return progressPercentage;
  } catch (error) {
    console.error("Error in updateCourseProgressData:", error);
    return 0;
  }
}

// Re-exportamos los tipos para facilitar su uso
export * from './types';
