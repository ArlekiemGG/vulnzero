
import * as queries from './queries';
import { updateCourseProgressData } from './course-progress';

/**
 * Marks a lesson as completed
 */
export async function markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<boolean> {
  try {
    // Check if lesson progress already exists
    const { data: existingProgress, error: checkError } = await queries.checkLessonProgressExists(
      userId, 
      courseId, 
      lessonId
    );
    
    if (checkError) {
      throw new Error(`Error checking lesson progress: ${checkError.message}`);
    }
    
    const completionData = {
      completed: true,
      completed_at: new Date().toISOString()
    };
    
    if (existingProgress) {
      // Update existing record
      const { error } = await queries.updateLessonProgress(existingProgress.id, completionData);
      if (error) throw new Error(`Error updating lesson progress: ${error.message}`);
    } else {
      // Create new record
      const { error } = await queries.createLessonProgress({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        ...completionData
      });
      
      if (error) throw new Error(`Error creating lesson progress: ${error.message}`);
    }
    
    // Update overall course progress
    await updateCourseProgressData(userId, courseId);
    
    return true;
  } catch (error) {
    console.error("Error in markLessonComplete:", error);
    return false;
  }
}

/**
 * Saves quiz results and marks the lesson as completed
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
    const { data: existingLesson, error: checkError } = await queries.checkLessonProgressExists(
      userId, 
      courseId, 
      lessonId
    );
    
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
      // Create new record
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
