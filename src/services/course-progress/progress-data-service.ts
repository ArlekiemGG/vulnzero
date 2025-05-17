
import { supabase } from '@/integrations/supabase/client';
import { ProgressResult, SimpleLessonProgress } from '@/types/course-progress';
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
      
      // First try to get user progress with normalized course ID
      let { data: userLessonProgress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .eq('completed', true);
      
      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }
      
      // If no progress found with normalized ID, try with original ID
      if (!userLessonProgress || userLessonProgress.length === 0) {
        console.log(`progressDataService: No progress found with normalized ID, trying original ID ${courseId}`);
        const { data: originalIdProgress, error: originalIdError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .eq('completed', true);
          
        if (!originalIdError) {
          userLessonProgress = originalIdProgress;
        }
      }
      
      // Get course sections
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', normalizedCourseId);
      
      if (sectionsError && sectionsError.code !== 'PGRST116') {
        // Ignore "no rows returned" error
        throw sectionsError;
      }
      
      let totalLessons = 0;
      
      // If we have sections in the database
      if (sections && sections.length > 0) {
        const sectionIds = sections.map(section => section.id);
        
        // Get lessons
        const { data: lessons, error: lessonsError } = await supabase
          .from('course_lessons')
          .select('id, section_id')
          .in('section_id', sectionIds);
        
        if (lessonsError && lessonsError.code !== 'PGRST116') {
          // Ignore "no rows returned" error
          throw lessonsError;
        }
        
        totalLessons = lessons?.length || 0;
      }
      
      // Calculate progress
      const completedLessonsCount = userLessonProgress ? userLessonProgress.length : 0;
      
      // Si no hay lecciones en la base de datos pero hay progreso del usuario,
      // asumimos que son lecciones de un curso estático
      const progress = totalLessons > 0 
        ? Math.round((completedLessonsCount / totalLessons) * 100) 
        : completedLessonsCount > 0 ? 100 : 0;
      
      // Create maps
      const completedLessons: Record<string, boolean> = {};
      const completedQuizzes: Record<string, boolean> = {};
      
      if (userLessonProgress) {
        userLessonProgress.forEach(lessonProgress => {
          const originalLessonId = lessonProgress.lesson_id;
          
          completedLessons[originalLessonId] = true;
          completedLessons[`${courseId}:${originalLessonId}`] = true;
          completedLessons[`${normalizedCourseId}:${originalLessonId}`] = true;
          
          // Check for quiz completion - explicitly cast the object to include quiz_score
          const progressWithQuiz = lessonProgress as SimpleLessonProgress;
          if (progressWithQuiz.quiz_score !== undefined && 
              typeof progressWithQuiz.quiz_score === 'number' && 
              progressWithQuiz.quiz_score > 0) {
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
