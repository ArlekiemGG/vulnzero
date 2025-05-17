
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { generateUUID, isValidUUID, normalizeId } from '@/utils/uuid-generator';

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
  fetchUserProgressData: async (courseId: string, userId: string) => {
    try {
      // Normalizar el ID del curso a UUID
      const normalizedCourseId = normalizeId(courseId);
      console.log(`courseProgressService: Fetching progress for course ${courseId} (normalized: ${normalizedCourseId}) and user ${userId}`);
      
      // Primero, obtenemos todas las lecciones del curso para calcular el progreso
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', normalizedCourseId);
      
      if (sectionsError) {
        console.error("courseProgressService: Error getting course sections:", sectionsError);
        throw sectionsError;
      }
      
      if (!sections || sections.length === 0) {
        console.warn(`No sections found for course: ${courseId} (normalized: ${normalizedCourseId})`);
        return {
          progress: 0,
          completedLessons: {},
          completedQuizzes: {}
        };
      }
      
      const sectionIds = sections.map(section => section.id);
      console.log(`courseProgressService: Found ${sectionIds.length} sections for course ${normalizedCourseId}`);
      
      // Obtenemos todas las lecciones de las secciones
      const { data: lessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('id, section_id')
        .in('section_id', sectionIds);
      
      if (lessonsError) {
        console.error("courseProgressService: Error getting section lessons:", lessonsError);
        throw lessonsError;
      }
      
      if (!lessons || lessons.length === 0) {
        console.warn(`No lessons found for course sections: ${sectionIds.join(', ')}`);
        return {
          progress: 0,
          completedLessons: {},
          completedQuizzes: {}
        };
      }
      
      console.log(`courseProgressService: Found ${lessons.length} lessons for course ${normalizedCourseId}`);
      
      // Obtenemos el progreso del usuario en las lecciones
      const { data: userLessonProgress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .eq('completed', true);
      
      if (progressError) {
        console.error("courseProgressService: Error getting user lesson progress:", progressError);
        throw progressError;
      }
      
      console.log(`courseProgressService: Found ${userLessonProgress?.length || 0} completed lessons for user ${userId} in course ${normalizedCourseId}`);
      
      // Calculamos el progreso
      const totalLessons = lessons.length;
      const completedLessonsCount = userLessonProgress ? userLessonProgress.length : 0;
      const progress = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;
      
      console.log(`courseProgressService: Progress for course ${normalizedCourseId}: ${progress}% (${completedLessonsCount}/${totalLessons})`);
      
      // Creamos un mapa de lecciones completadas con múltiples formatos de clave para máxima compatibilidad
      const completedLessons: Record<string, boolean> = {};
      const completedQuizzes: Record<string, boolean> = {};
      
      if (userLessonProgress) {
        userLessonProgress.forEach(lessonProgress => {
          // Creamos múltiples formatos de clave para compatibilidad
          const originalLessonId = lessonProgress.lesson_id;
          
          // Usamos múltiples formatos de clave para compatibilidad con diferentes partes del código
          completedLessons[originalLessonId] = true;
          completedLessons[`${courseId}:${originalLessonId}`] = true;
          completedLessons[`${normalizedCourseId}:${originalLessonId}`] = true;
          
          // También registramos si es un quiz
          // Verificamos si quiz_score existe en lessonProgress con comprobación de tipo adecuada
          if (lessonProgress.hasOwnProperty('quiz_score') && 
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
      console.log(`courseProgressService: Fetching lesson progress for user ${userId}, lesson ${lessonId} (normalized: ${normalizedLessonId})`);
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
      
      if (error) {
        console.error("courseProgressService: Error fetching lesson progress:", error);
        throw error;
      }
      
      console.log(`courseProgressService: Lesson progress for ${normalizedLessonId}:`, data);
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
      // Normalizar el ID del curso a UUID
      const normalizedCourseId = normalizeId(courseId);
      console.log(`courseProgressService: Getting course progress for user ${userId}, course ${courseId} (normalized: ${normalizedCourseId})`);
      
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .maybeSingle();
      
      if (error) {
        console.error("courseProgressService: Error getting course progress:", error);
        throw error;
      }
      
      console.log(`courseProgressService: Course progress:`, data);
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
      console.log(`courseProgressService: Marking lesson ${lessonId} as completed for user ${userId} in course ${courseId}`);
      
      // Normalizar IDs a UUID
      const normalizedCourseId = normalizeId(courseId);
      const normalizedLessonId = normalizeId(lessonId);
      
      console.log(`courseProgressService: Normalized IDs: courseId=${normalizedCourseId}, lessonId=${normalizedLessonId}`);
      
      // Verificar si ya existe un registro de progreso para esta lección
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
      
      if (checkError) {
        console.error("courseProgressService: Error checking for existing progress:", checkError);
        throw checkError;
      }
      
      const now = new Date().toISOString();
      let success = false;
      
      if (existingProgress) {
        // Actualizar el registro existente
        console.log(`courseProgressService: Updating existing progress record ${existingProgress.id}`);
        
        const { error: updateError } = await supabase
          .from('user_lesson_progress')
          .update({
            completed: true,
            completed_at: now,
            course_id: normalizedCourseId
          })
          .eq('id', existingProgress.id);
        
        if (updateError) {
          console.error("courseProgressService: Error updating lesson progress:", updateError);
          throw updateError;
        }
        
        success = true;
      } else {
        // Crear un nuevo registro
        console.log(`courseProgressService: Creating new progress record for lesson ${normalizedLessonId}`);
        
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
          console.error("courseProgressService: Error creating lesson progress:", insertError);
          throw insertError;
        }
        
        success = true;
      }
      
      // Actualizar el progreso general del curso
      if (success) {
        console.log(`courseProgressService: Updating course progress for course ${normalizedCourseId}`);
        
        // Ejecutar la función para asegurarnos de que todos los registros tienen el course_id correcto
        await courseProgressService.updateCourseProgressData(userId, normalizedCourseId);
        
        // Registrar la actividad del usuario
        try {
          await supabase.rpc('log_user_activity', {
            p_user_id: userId,
            p_type: 'lesson_completion',
            p_title: `Completó una lección del curso`,
            p_points: 10 // Puntos por completar una lección
          });
          console.log(`courseProgressService: Activity logged for user ${userId}`);
        } catch (activityError) {
          console.error("courseProgressService: Error logging activity:", activityError);
          // No fallamos toda la operación si el registro de actividad falla
        }
      }
      
      console.log(`courseProgressService: Lesson marking complete result: ${success}`);
      return success;
    } catch (error) {
      console.error("Error in markLessonComplete:", error);
      return false;
    }
  },

  /**
   * Actualiza los datos de progreso del curso
   */
  updateCourseProgressData: async (userId: string, courseId: string): Promise<boolean> => {
    try {
      console.log(`courseProgressService: Updating course progress data for user ${userId}, course ${courseId}`);
      
      // Normalizar ID del curso
      const normalizedCourseId = normalizeId(courseId);
      
      // 1. Primero nos aseguramos de que todos los registros tienen el course_id correcto
      try {
        const { error } = await supabase.rpc('update_lesson_progress_course_id');
        
        if (error) {
          console.error("courseProgressService: Error updating lesson progress course IDs:", error);
        }
      } catch (error) {
        console.error("courseProgressService: Error calling update_lesson_progress_course_id:", error);
        // Continuar a pesar del error
      }
      
      // 2. Contar lecciones totales para el curso
      // Primero construimos el subquery correctamente
      const sectionsSubquery = supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', normalizedCourseId);
      
      // Fix: Create an array of section ids to use with the 'in' method
      const { data: sectionData } = await sectionsSubquery;
      const sectionIds = sectionData ? sectionData.map(section => section.id) : [];
      
      // If no sections found, return early
      if (sectionIds.length === 0) {
        console.log(`courseProgressService: No sections found for course ${normalizedCourseId}`);
        return false;
      }
      
      const { count, error: countError } = await supabase
        .from('course_lessons')
        .select('id', { count: 'exact', head: true })
        .in('section_id', sectionIds);
      
      if (countError) {
        console.error("courseProgressService: Error counting total lessons:", countError);
        throw countError;
      }
      
      const totalLessons = count || 0;
      console.log(`courseProgressService: Total lessons for course ${normalizedCourseId}: ${totalLessons}`);
      
      // 3. Contar lecciones completadas por el usuario
      const { data: completedLessons, error: completedError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .eq('completed', true);
      
      if (completedError) {
        console.error("courseProgressService: Error counting completed lessons:", completedError);
        throw completedError;
      }
      
      const completedCount = completedLessons?.length || 0;
      console.log(`courseProgressService: Completed lessons for user ${userId} in course ${normalizedCourseId}: ${completedCount}`);
      
      // 4. Calcular porcentaje de progreso
      const progressPercentage = totalLessons > 0 
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;
      
      const isCompleted = totalLessons > 0 && completedCount >= totalLessons;
      
      console.log(`courseProgressService: Progress for course ${normalizedCourseId}: ${progressPercentage}%, completed: ${isCompleted}`);
      
      // 5. Actualizar o crear registro de progreso del curso
      const now = new Date().toISOString();
      
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .maybeSingle();
      
      if (checkError) {
        console.error("courseProgressService: Error checking course progress:", checkError);
        throw checkError;
      }
      
      if (existingProgress) {
        // Actualizar registro existente
        console.log(`courseProgressService: Updating existing course progress record ${existingProgress.id}`);
        
        const { error: updateError } = await supabase
          .from('user_course_progress')
          .update({
            progress_percentage: progressPercentage,
            completed: isCompleted,
            completed_at: isCompleted ? now : null
          })
          .eq('id', existingProgress.id);
        
        if (updateError) {
          console.error("courseProgressService: Error updating course progress:", updateError);
          throw updateError;
        }
      } else {
        // Crear nuevo registro
        console.log(`courseProgressService: Creating new course progress record for user ${userId}, course ${normalizedCourseId}`);
        
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
          console.error("courseProgressService: Error creating course progress:", insertError);
          throw insertError;
        }
      }
      
      console.log(`courseProgressService: Course progress updated successfully for ${normalizedCourseId}: ${progressPercentage}%`);
      return true;
    } catch (error) {
      console.error('Error in updateCourseProgressData:', error);
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
      console.log(`courseProgressService: Saving quiz results for lesson ${lessonId}, course ${courseId}, user ${userId}`);
      
      // Normalizar IDs a UUID
      const normalizedCourseId = normalizeId(courseId);
      const normalizedLessonId = normalizeId(lessonId);
      
      console.log(`courseProgressService: Normalized IDs: courseId=${normalizedCourseId}, lessonId=${normalizedLessonId}`);
      
      // El resto del proceso es similar a markLessonComplete pero con datos adicionales del quiz
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
      
      if (checkError) {
        console.error("courseProgressService: Error checking quiz progress:", checkError);
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
        // Actualizar registro existente con resultados del quiz
        console.log(`courseProgressService: Updating existing quiz progress record ${existingProgress.id}`);
        
        // Utilizamos typecast para evitar el error de TypeScript
        const { error: updateError } = await supabase
          .from('user_lesson_progress')
          .update(quizData as any)
          .eq('id', existingProgress.id);
        
        if (updateError) {
          console.error("courseProgressService: Error updating quiz progress:", updateError);
          throw updateError;
        }
      } else {
        // Crear nuevo registro con resultados del quiz
        console.log(`courseProgressService: Creating new quiz progress record`);
        
        // Utilizamos typecast para evitar el error de TypeScript
        const { error: insertError } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: userId,
            lesson_id: normalizedLessonId,
            ...quizData
          } as any);
        
        if (insertError) {
          console.error("courseProgressService: Error creating quiz progress:", insertError);
          throw insertError;
        }
      }
      
      // Actualizar el progreso general del curso
      await courseProgressService.updateCourseProgressData(userId, normalizedCourseId);
      
      // Registrar la actividad con puntos basados en la puntuación del quiz
      const pointsEarned = Math.round(score / 10); // 0-10 puntos basados en la puntuación
      
      try {
        await supabase.rpc('log_user_activity', {
          p_user_id: userId,
          p_type: 'quiz_completion',
          p_title: `Completó un quiz con ${score}% de acierto`,
          p_points: pointsEarned
        });
        console.log(`courseProgressService: Quiz activity logged for user ${userId}, earned ${pointsEarned} points`);
      } catch (activityError) {
        console.error("courseProgressService: Error logging quiz activity:", activityError);
        // No fallamos toda la operación si el registro de actividad falla
      }
      
      return true;
    } catch (error) {
      console.error('Error in saveQuizResults:', error);
      return false;
    }
  }
};
