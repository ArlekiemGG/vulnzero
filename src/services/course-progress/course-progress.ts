
import * as queries from './queries';

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
