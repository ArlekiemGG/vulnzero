
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { generateUUID, isValidUUID, normalizeId } from '@/utils/uuid-generator';
import { LessonProgressItem, SimpleLessonProgress } from '@/types/course-progress';
import { courseProgressUpdater } from './course-progress-updater';

/**
 * Service for managing lesson progress
 */
export const lessonProgressService = {
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
   * Marca una lección como completada
   */
  markLessonComplete: async (userId: string, courseId: string, lessonId: string): Promise<boolean> => {
    try {
      // Normalizar IDs a UUID
      const normalizedCourseId = normalizeId(courseId);
      const normalizedLessonId = normalizeId(lessonId);
      
      // Primero verificamos si la lección existe en la tabla course_lessons
      const { data: existingLesson, error: lessonCheckError } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('id', normalizedLessonId)
        .maybeSingle();
        
      if (lessonCheckError) {
        console.error("Error checking if lesson exists:", lessonCheckError);
      }
      
      // Si la lección no existe en la tabla course_lessons
      // almacenamos el progreso usando el ID original sin normalizar
      // esto es útil para lecciones de cursos estáticos que no están en la base de datos
      const lessonIdToUse = existingLesson ? normalizedLessonId : lessonId;
      
      // Check for existing progress
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonIdToUse)
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
            lesson_id: lessonIdToUse,
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
        await courseProgressUpdater.updateCourseProgressData(userId, normalizedCourseId);
        
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
      
      // Primero verificamos si la lección existe en la tabla course_lessons
      const { data: existingLesson, error: lessonCheckError } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('id', normalizedLessonId)
        .maybeSingle();
        
      if (lessonCheckError) {
        console.error("Error checking if lesson exists:", lessonCheckError);
      }
      
      // Si la lección no existe en la tabla course_lessons
      // almacenamos el progreso usando el ID original sin normalizar
      const lessonIdToUse = existingLesson ? normalizedLessonId : lessonId;
      
      // Check for existing progress
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonIdToUse)
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
            lesson_id: lessonIdToUse,
            ...quizData
          });
        
        if (insertError) {
          throw insertError;
        }
      }
      
      // Update course progress
      await courseProgressUpdater.updateCourseProgressData(userId, normalizedCourseId);
      
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
  }
};
