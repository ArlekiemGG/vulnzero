
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { generateUUID, isValidUUID, normalizeId } from '@/utils/uuid-generator';
import { 
  LessonProgressItem,
  ProgressResult,
  SimpleLessonProgress
} from '@/types/course-progress';

/**
 * Service centralizado para gestionar el progreso de cursos y lecciones
 */
export const courseProgressService = {
  /**
   * Obtiene información del curso al que pertenece una lección
   */
  getLessonCourseInfo: async (lessonId: string) => {
    try {
      // Normalizar el ID de lección a UUID
      const normalizedLessonId = normalizeId(lessonId);
      console.log(`courseProgressService: Getting course info for lesson ${lessonId} (normalized: ${normalizedLessonId})`);
      
      const { data, error } = await supabase
        .from('course_lessons')
        .select(`
          section_id,
          course_sections (
            course_id
          )
        `)
        .eq('id', normalizedLessonId)
        .single();
      
      if (error) {
        console.error("courseProgressService: Error getting lesson course info:", error);
        throw error;
      }
      
      console.log(`courseProgressService: Found course info for lesson:`, data);
      return { data };
    } catch (error) {
      console.error('Error in getLessonCourseInfo:', error);
      return { data: null };
    }
  },

  /**
   * Obtiene el progreso de un usuario en un curso específico
   */
  fetchUserProgressData: async (courseId: string, userId: string): Promise<ProgressResult> => {
    try {
      const normalizedCourseId = normalizeId(courseId);
      console.log(`courseProgressService: Fetching progress for course ${courseId} (normalized: ${normalizedCourseId}) and user ${userId}`);
      
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
  },

  /**
   * Obtiene el progreso específico de una lección
   */
  fetchLessonProgressByLessonId: async (userId: string, lessonId: string) => {
    try {
      // Normalizar el ID de lección a UUID
      const normalizedLessonId = normalizeId(lessonId);
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      return { data };
    } catch (error) {
      console.error('Error in fetchLessonProgressByLessonId:', error);
      return { data: null };
    }
  },

  /**
   * Obtiene el progreso de un curso específico para un usuario
   */
  getCourseProgress: async (userId: string, courseId: string) => {
    try {
      const normalizedCourseId = normalizeId(courseId);
      
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error in getCourseProgress:', error);
      return { data: null, error };
    }
  },

  /**
   * Marca una lección como completada
   */
  markLessonComplete: async (userId: string, courseId: string, lessonId: string): Promise<boolean> => {
    try {
      // Normalizar IDs a UUID
      const normalizedCourseId = normalizeId(courseId);
      const normalizedLessonId = normalizeId(lessonId);
      
      // Check for existing progress
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
      
      if (checkError) {
        throw checkError;
      }
      
      const now = new Date().toISOString();
      let success = false;
      
      if (existingProgress) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_lesson_progress')
          .update({
            completed: true,
            completed_at: now,
            course_id: normalizedCourseId
          })
          .eq('id', existingProgress.id);
        
        if (updateError) {
          throw updateError;
        }
        
        success = true;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: userId,
            lesson_id: normalizedLessonId,
            course_id: normalizedCourseId,
            completed: true,
            completed_at: now
          });
        
        if (insertError) {
          throw insertError;
        }
        
        success = true;
      }
      
      // Update course progress
      if (success) {
        // Update course_id in all lesson progress records
        await courseProgressService.updateCourseProgressData(userId, normalizedCourseId);
        
        // Log activity
        try {
          await supabase.rpc('log_user_activity', {
            p_user_id: userId,
            p_type: 'lesson_completion',
            p_title: `Completó una lección del curso`,
            p_points: 10
          });
        } catch (activityError) {
          console.error("Error logging activity:", activityError);
        }
      }
      
      return success;
    } catch (error) {
      console.error("Error in markLessonComplete:", error);
      return false;
    }
  },

  /**
   * Guarda los resultados de un quiz
   */
  saveQuizResults: async (
    userId: string, 
    courseId: string, 
    lessonId: string, 
    score: number, 
    answers: Record<string, number>
  ): Promise<boolean> => {
    try {
      // Normalizar IDs a UUID
      const normalizedCourseId = normalizeId(courseId);
      const normalizedLessonId = normalizeId(lessonId);
      
      // Check for existing progress
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
      
      if (checkError) {
        throw checkError;
      }
      
      const now = new Date().toISOString();
      const quizData = {
        completed: true,
        completed_at: now,
        course_id: normalizedCourseId,
        quiz_score: score,
        quiz_answers: answers
      };
      
      if (existingProgress) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_lesson_progress')
          .update(quizData)
          .eq('id', existingProgress.id);
        
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: userId,
            lesson_id: normalizedLessonId,
            ...quizData
          });
        
        if (insertError) {
          throw insertError;
        }
      }
      
      // Update course progress
      await courseProgressService.updateCourseProgressData(userId, normalizedCourseId);
      
      // Log activity
      const pointsEarned = Math.round(score / 10);
      
      try {
        await supabase.rpc('log_user_activity', {
          p_user_id: userId,
          p_type: 'quiz_completion',
          p_title: `Completó un quiz con ${score}% de acierto`,
          p_points: pointsEarned
        });
      } catch (activityError) {
        console.error("Error logging quiz activity:", activityError);
      }
      
      return true;
    } catch (error) {
      console.error('Error in saveQuizResults:', error);
      return false;
    }
  },

  /**
   * Actualiza los datos de progreso del curso
   */
  updateCourseProgressData: async (userId: string, courseId: string): Promise<boolean> => {
    try {
      // Normalizar ID del curso
      const normalizedCourseId = normalizeId(courseId);
      
      // 1. Ensure all records have the correct course_id
      try {
        const { error } = await supabase.rpc('update_lesson_progress_course_id');
        
        if (error) {
          console.error("Error updating lesson progress course IDs:", error);
        }
      } catch (error) {
        console.error("Error calling update_lesson_progress_course_id:", error);
      }
      
      // 2. Count total lessons
      const sectionsSubquery = supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', normalizedCourseId);
      
      const { data: sectionData } = await sectionsSubquery;
      const sectionIds = sectionData ? sectionData.map(section => section.id) : [];
      
      if (sectionIds.length === 0) {
        return false;
      }
      
      const { count, error: countError } = await supabase
        .from('course_lessons')
        .select('id', { count: 'exact', head: true })
        .in('section_id', sectionIds);
      
      if (countError) {
        throw countError;
      }
      
      const totalLessons = count || 0;
      
      // 3. Count completed lessons
      const { data: completedLessons, error: completedError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .eq('completed', true);
      
      if (completedError) {
        throw completedError;
      }
      
      const completedCount = completedLessons?.length || 0;
      
      // 4. Calculate progress percentage
      const progressPercentage = totalLessons > 0 
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;
      
      const isCompleted = totalLessons > 0 && completedCount >= totalLessons;
      
      // 5. Update or create course progress record
      const now = new Date().toISOString();
      
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .maybeSingle();
      
      if (checkError) {
        throw checkError;
      }
      
      if (existingProgress) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_course_progress')
          .update({
            progress_percentage: progressPercentage,
            completed: isCompleted,
            completed_at: isCompleted ? now : null
          })
          .eq('id', existingProgress.id);
        
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('user_course_progress')
          .insert({
            user_id: userId,
            course_id: normalizedCourseId,
            progress_percentage: progressPercentage,
            started_at: now,
            completed: isCompleted,
            completed_at: isCompleted ? now : null
          });
        
        if (insertError) {
          throw insertError;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateCourseProgressData:', error);
      return false;
    }
  }
};
