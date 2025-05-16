
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { generateUUID, isValidUUID } from '@/utils/uuid-generator';

/**
 * Service centralizado para gestionar el progreso de cursos y lecciones
 */
export const courseProgressService = {
  /**
   * Convierte un ID alfanumérico a UUID si es necesario
   */
  normalizeId: (id: string): string => {
    if (!id) return '';
    
    // Si ya es un UUID válido, lo devolvemos como está
    if (isValidUUID(id)) {
      return id;
    }
    
    // Caso contrario, generamos un UUID determinista basado en el string
    return generateUUID(id);
  },

  /**
   * Obtiene información del curso al que pertenece una lección
   */
  getLessonCourseInfo: async (lessonId: string) => {
    try {
      // Normalizar el ID de lección a UUID
      const normalizedLessonId = courseProgressService.normalizeId(lessonId);
      
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
      
      if (error) throw error;
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
      const normalizedCourseId = courseProgressService.normalizeId(courseId);
      
      // Primero, obtenemos todas las lecciones del curso para calcular el progreso
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', normalizedCourseId);
      
      if (sectionsError) throw sectionsError;
      
      if (!sections || sections.length === 0) {
        console.warn(`No sections found for course: ${courseId} (normalized: ${normalizedCourseId})`);
        return {
          progress: 0,
          completedLessons: {},
          completedQuizzes: {}
        };
      }
      
      const sectionIds = sections.map(section => section.id);
      
      // Obtenemos todas las lecciones de las secciones
      const { data: lessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('id, section_id')
        .in('section_id', sectionIds);
      
      if (lessonsError) throw lessonsError;
      
      if (!lessons || lessons.length === 0) {
        console.warn(`No lessons found for course sections: ${sectionIds.join(', ')}`);
        return {
          progress: 0,
          completedLessons: {},
          completedQuizzes: {}
        };
      }
      
      // Obtenemos el progreso del usuario en las lecciones
      const { data: userLessonProgress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .eq('completed', true);
      
      if (progressError) throw progressError;
      
      // Calculamos el progreso
      const totalLessons = lessons.length;
      const completedLessonsCount = userLessonProgress ? userLessonProgress.length : 0;
      const progress = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;
      
      // Creamos un mapa de lecciones completadas
      const completedLessons: Record<string, boolean> = {};
      const completedQuizzes: Record<string, boolean> = {};
      
      userLessonProgress?.forEach(lessonProgress => {
        // Mapeamos tanto los UUIDs como los IDs originales para mantener compatibilidad
        const originalLessonId = Object.keys(courseProgressService._idMappings).find(
          key => courseProgressService._idMappings[key] === lessonProgress.lesson_id
        ) || lessonProgress.lesson_id;
        
        // Usamos múltiples formatos de clave para compatibilidad con diferentes partes del código
        completedLessons[originalLessonId] = true;
        completedLessons[lessonProgress.lesson_id] = true;
        completedLessons[`${courseId}:${originalLessonId}`] = true;
        completedLessons[`${normalizedCourseId}:${lessonProgress.lesson_id}`] = true;
        
        // También registramos si es un quiz
        const quizScore = (lessonProgress as any).quiz_score;
        if (quizScore && quizScore > 0) {
          completedQuizzes[originalLessonId] = true;
          completedQuizzes[lessonProgress.lesson_id] = true;
          completedQuizzes[`${courseId}:${originalLessonId}`] = true;
          completedQuizzes[`${normalizedCourseId}:${lessonProgress.lesson_id}`] = true;
        }
      });
      
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
      const normalizedLessonId = courseProgressService.normalizeId(lessonId);
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
      
      if (error) throw error;
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
      const normalizedCourseId = courseProgressService.normalizeId(courseId);
      
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', normalizedCourseId)
        .maybeSingle();
      
      if (error) throw error;
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
      console.log(`Marking lesson as completed: userId=${userId}, courseId=${courseId}, lessonId=${lessonId}`);
      
      // Normalizar IDs a UUID
      const normalizedCourseId = courseProgressService.normalizeId(courseId);
      const normalizedLessonId = courseProgressService.normalizeId(lessonId);
      
      console.log(`Normalized IDs: courseId=${normalizedCourseId}, lessonId=${normalizedLessonId}`);
      
      // Registrar el mapeo para uso futuro
      courseProgressService._idMappings[courseId] = normalizedCourseId;
      courseProgressService._idMappings[lessonId] = normalizedLessonId;
      
      // Verificar si ya existe un registro de progreso para esta lección
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingProgress) {
        // Actualizar el registro existente
        const { error: updateError } = await supabase
          .from('user_lesson_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            course_id: normalizedCourseId
          })
          .eq('id', existingProgress.id);
        
        if (updateError) throw updateError;
      } else {
        // Crear un nuevo registro
        const { error: insertError } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: userId,
            lesson_id: normalizedLessonId,
            course_id: normalizedCourseId,
            completed: true,
            completed_at: new Date().toISOString()
          });
        
        if (insertError) throw insertError;
      }
      
      // Actualizar el progreso general del curso
      await courseProgressService.updateCourseProgressData(userId, normalizedCourseId);
      
      // Registrar la actividad
      await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_type: 'lesson_completion',
        p_title: `Completó una lección del curso`,
        p_points: 10 // Puntos por completar una lección
      });
      
      return true;
    } catch (error) {
      console.error('Error in markLessonComplete:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el progreso de la lección",
        variant: "destructive",
      });
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
      const normalizedCourseId = courseProgressService.normalizeId(courseId);
      const normalizedLessonId = courseProgressService.normalizeId(lessonId);
      
      // Verificar si ya existe un registro de progreso para esta lección
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', normalizedLessonId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // Define el objeto quiz_answers con tipo explícito para TypeScript
      const quizData: {
        completed: boolean;
        completed_at: string;
        course_id: string;
        quiz_score?: number;
        quiz_answers?: Record<string, number>;
      } = {
        completed: true,
        completed_at: new Date().toISOString(),
        course_id: normalizedCourseId,
        quiz_score: score,
        quiz_answers: answers
      };
      
      if (existingProgress) {
        // Actualizar el registro existente
        const { error: updateError } = await supabase
          .from('user_lesson_progress')
          .update(quizData)
          .eq('id', existingProgress.id);
        
        if (updateError) throw updateError;
      } else {
        // Crear un nuevo registro
        const { error: insertError } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: userId,
            lesson_id: normalizedLessonId,
            ...quizData
          });
        
        if (insertError) throw insertError;
      }
      
      // Actualizar el progreso general del curso
      await courseProgressService.updateCourseProgressData(userId, normalizedCourseId);
      
      // Registrar la actividad
      const pointsEarned = Math.round(score / 10); // 0-10 puntos basados en la puntuación
      await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_type: 'quiz_completion',
        p_title: `Completó un quiz con ${score}% de acierto`,
        p_points: pointsEarned
      });
      
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
      // Llamar a la función de actualización del progreso del curso
      const { error } = await supabase.rpc('update_lesson_progress_course_id');
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error in updateCourseProgressData:', error);
      return false;
    }
  },

  // Cache para mapear IDs originales a UUIDs generados
  _idMappings: {} as Record<string, string>
};
