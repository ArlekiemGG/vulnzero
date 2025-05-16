
import * as queries from './queries';
import { updateCourseProgressData } from './course-progress';

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
        course_id: courseId, // Aseguramos que course_id siempre se incluya
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
        course_id: courseId, // Aseguramos que course_id siempre se incluya
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
