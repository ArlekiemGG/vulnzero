
import { supabase } from '@/integrations/supabase/client';
import { ProgressResult } from '@/types/course-progress';
import { normalizeId } from '@/utils/uuid-generator';

/**
 * Service for retrieving user progress data
 */
export const progressDataService = {
  /**
   * Recupera los datos de progreso del usuario para un curso específico
   */
  fetchUserProgressData: async (courseId: string, userId: string): Promise<ProgressResult> => {
    try {
      const normalizedCourseId = normalizeId(courseId);
      console.log(`progressDataService: Fetching progress for course ${courseId} (normalized: ${normalizedCourseId}) and user ${userId}`);
      
      // Get course sections
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', normalizedCourseId);
      
      if (sectionsError) {
        throw sectionsError;
      }
      
      if (!sections || sections.length === 0) {
        return { progress: 0, completedLessons: {}, completedQuizzes: {} };
      }
      
      const sectionIds = sections.map(section => section.id);
      
      // Get lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('id, section_id')
        .in('section_id', sectionIds);
      
      if (lessonsError) {
        throw lessonsError;
      }
      
      if (!lessons || lessons.length === 0) {
        return { progress: 0, completedLessons: {}, completedQuizzes: {} };
      }
      
      // Get user progress
      const { data: userLessonProgress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .eq('completed', true);
      
      if (progressError) {
        throw progressError;
      }
      
      // Calculate progress
      const totalLessons = lessons.length;
      const completedLessonsCount = userLessonProgress ? userLessonProgress.length : 0;
      const progress = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;
      
      // Create maps
      const completedLessons: Record<string, boolean> = {};
      const completedQuizzes: Record<string, boolean> = {};
      
      if (userLessonProgress) {
        userLessonProgress.forEach(lessonProgress => {
          const originalLessonId = lessonProgress.lesson_id;
          
          completedLessons[originalLessonId] = true;
          completedLessons[`${courseId}:${originalLessonId}`] = true;
          completedLessons[`${normalizedCourseId}:${originalLessonId}`] = true;
          
          // Check for quiz completion
          if (lessonProgress.quiz_score !== undefined && 
              typeof lessonProgress.quiz_score === 'number' && 
              lessonProgress.quiz_score > 0) {
            completedQuizzes[originalLessonId] = true;
            completedQuizzes[`${courseId}:${originalLessonId}`] = true;
            completedQuizzes[`${normalizedCourseId}:${originalLessonId}`] = true;
          }
        });
      }
      
      return {
        progress,
        completedLessons,
        completedQuizzes
      };
    } catch (error) {
      console.error('Error in fetchUserProgressData:', error);
      return {
        progress: 0,
        completedLessons: {},
        completedQuizzes: {}
      };
    }
  }
};
