
import { ProgressResult, QuizResult } from './types';
import * as queries from './queries';

/**
 * Obtiene los datos de progreso del usuario para un curso específico
 */
export async function fetchUserProgressData(courseId: string, userId: string): Promise<ProgressResult> {
  // Fetch course progress data
  const { data: progressData, error: progressError } = await queries.getCourseProgress(userId, courseId);
  if (progressError) throw progressError;

  // Fetch lesson progress data - cast a any para evitar el error de tipo
  const lessonProgressResult: any = await queries.getLessonProgress(userId, courseId);
  if (lessonProgressResult.error) throw lessonProgressResult.error;
  
  // Process and set data
  const progress = progressData?.progress_percentage || 0;
  const completedLessonsMap: Record<string, boolean> = {};
  const completedQuizzesMap: Record<string, boolean> = {};
  
  if (lessonProgressResult.data && Array.isArray(lessonProgressResult.data)) {
    lessonProgressResult.data.forEach((item: { lesson_id: string; completed: boolean }) => {
      if (item && item.completed) {
        // Create lesson key using courseId and lessonId
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
}

/**
 * Marca una lección como completada
 */
export async function markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<boolean> {
  // Check if the lesson is already marked as completed
  const { data: existingProgress } = await queries.checkLessonProgressExists(userId, courseId, lessonId);
  
  if (existingProgress) {
    // Update existing record
    const result = await queries.updateLessonProgress(existingProgress.id, {
      completed: true,
      completed_at: new Date().toISOString()
    });
    
    if (result.error) throw result.error;
  } else {
    // Create new record
    const result = await queries.createLessonProgress({
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString()
    });
    
    if (result.error) throw result.error;
  }
  
  // Update course progress
  await updateCourseProgressData(userId, courseId);
  
  return true;
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
  // Check if lesson progress already exists
  const { data: existingLesson } = await queries.checkLessonProgressExists(userId, courseId, lessonId);
  
  const lessonData = {
    completed: true,
    completed_at: new Date().toISOString()
  };
  
  if (existingLesson) {
    // Update existing record
    const result = await queries.updateLessonProgress(existingLesson.id, lessonData);
    if (result.error) throw result.error;
  } else {
    // Create new lesson progress record
    const result = await queries.createLessonProgress({
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      ...lessonData
    });
    
    if (result.error) throw result.error;
  }
  
  // Update course progress
  await updateCourseProgressData(userId, courseId);
  
  return true;
}

/**
 * Actualiza los datos de progreso del curso
 */
export async function updateCourseProgressData(userId: string, courseId: string): Promise<number> {
  // Use any type to avoid deep type instantiation
  const totalLessonsResult: any = await queries.countTotalLessons(courseId);
  
  const totalLessonsCount = totalLessonsResult.count;
  if (totalLessonsResult.error) throw totalLessonsResult.error;
  
  // Use any type to avoid deep type instantiation
  const completedLessonsResult: any = await queries.countCompletedLessons(userId, courseId);
  
  const completedLessonsData = completedLessonsResult.data;
  if (completedLessonsResult.error) throw completedLessonsResult.error;
  
  const totalLessons = totalLessonsCount || 0;
  const completedCount = completedLessonsData?.length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const completed = progressPercentage === 100;
  
  // Check if course progress record exists
  const { data: existingProgress } = await queries.checkCourseProgressExists(userId, courseId);
  
  const updateData = {
    progress_percentage: progressPercentage,
    completed,
    completed_at: completed ? new Date().toISOString() : null
  };
  
  if (existingProgress) {
    // Update existing record
    await queries.updateCourseProgressRecord(existingProgress.id, updateData);
  } else {
    // Create new record
    await queries.createCourseProgressRecord({
      user_id: userId,
      course_id: courseId,
      ...updateData,
      started_at: new Date().toISOString()
    });
  }
  
  return progressPercentage;
}

// Re-exportamos los tipos para facilitar su uso
export * from './types';
