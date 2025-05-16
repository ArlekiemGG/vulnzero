import { supabase } from '@/integrations/supabase/client';
import { 
  CourseProgressItem, 
  LessonProgressItem,
  CompletedLessonsMap,
  ProgressResult,
  TotalLessonsResponse,
  SupabaseSimpleResponse
} from '@/types/course-progress';

/**
 * Servicio unificado para gestionar el progreso de cursos
 */
class CourseProgressService {
  /**
   * Recupera el progreso del curso para un usuario y curso específico
   */
  async getCourseProgress(userId: string, courseId: string): Promise<SupabaseSimpleResponse> {
    console.log(`CourseProgressService: Getting course progress for user ${userId} and course ${courseId}`);
    try {
      return await supabase
        .from('user_course_progress')
        .select('progress_percentage, completed')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();
    } catch (error) {
      console.error(`CourseProgressService: Error getting course progress:`, error);
      return { data: null, error };
    }
  }

  /**
   * Recupera el progreso de las lecciones para un usuario y curso específico
   */
  async getLessonProgress(userId: string, courseId: string): Promise<SupabaseSimpleResponse> {
    console.log(`CourseProgressService: Getting lesson progress for user ${userId} and course ${courseId}`);
    try {
      return await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed, course_id')
        .eq('user_id', userId)
        .eq('course_id', courseId);
    } catch (error) {
      console.error(`CourseProgressService: Error getting lesson progress:`, error);
      return { data: null, error };
    }
  }

  /**
   * Obtener información del curso al que pertenece una lección
   */
  async getLessonCourseInfo(lessonId: string): Promise<SupabaseSimpleResponse> {
    console.log(`CourseProgressService: Getting course info for lesson ${lessonId}`);
    try {
      return await supabase
        .from('course_lessons')
        .select(`
          section_id,
          course_sections:section_id (
            course_id
          )
        `)
        .eq('id', lessonId)
        .maybeSingle();
    } catch (error) {
      console.error(`CourseProgressService: Error getting lesson course info:`, error);
      return { data: null, error };
    }
  }

  /**
   * Obtener el progreso de una lección por su ID sin conocer el curso
   */
  async fetchLessonProgressByLessonId(userId: string, lessonId: string): Promise<SupabaseSimpleResponse> {
    console.log(`CourseProgressService: Fetching lesson progress by lessonId for user ${userId} and lesson ${lessonId}`);
    try {
      return await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();
    } catch (error) {
      console.error(`CourseProgressService: Error fetching lesson progress:`, error);
      return { data: null, error };
    }
  }

  /**
   * Verifica si existe un registro de progreso para una lección
   */
  async checkLessonProgressExists(
    userId: string, 
    courseId: string, 
    lessonId: string
  ): Promise<SupabaseSimpleResponse> {
    console.log(`CourseProgressService: Checking if lesson progress exists for user ${userId}, course ${courseId}, lesson ${lessonId}`);
    try {
      return await supabase
        .from('user_lesson_progress')
        .select('id, completed')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('lesson_id', lessonId)
        .maybeSingle();
    } catch (error) {
      console.error(`CourseProgressService: Error checking lesson progress:`, error);
      return { data: null, error };
    }
  }

  /**
   * Actualiza un registro existente de progreso de lección
   */
  async updateLessonProgress(
    id: string, 
    data: Partial<LessonProgressItem>
  ): Promise<SupabaseSimpleResponse> {
    console.log(`CourseProgressService: Updating lesson progress with ID ${id}`, data);
    try {
      return await supabase
        .from('user_lesson_progress')
        .update(data)
        .eq('id', id);
    } catch (error) {
      console.error(`CourseProgressService: Error updating lesson progress:`, error);
      return { data: null, error };
    }
  }

  /**
   * Crea un nuevo registro de progreso de lección
   */
  async createLessonProgress(data: LessonProgressItem): Promise<SupabaseSimpleResponse> {
    console.log(`CourseProgressService: Creating new lesson progress entry`, data);
    // Remove id field if empty as Supabase will generate it
    if (data.id === '') {
      delete data.id;
    }
    try {
      return await supabase
        .from('user_lesson_progress')
        .insert([data]);
    } catch (error) {
      console.error(`CourseProgressService: Error creating lesson progress:`, error);
      return { data: null, error };
    }
  }

  /**
   * Cuenta el total de lecciones en un curso
   */
  async countTotalLessons(courseId: string): Promise<TotalLessonsResponse> {
    console.log(`CourseProgressService: Counting total lessons for course ${courseId}`);
    
    try {
      // First get all sections for this course
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', courseId);
      
      if (sectionsError || !sections || sections.length === 0) {
        console.error(`CourseProgressService: Error fetching course sections:`, sectionsError);
        return { count: 0, error: sectionsError || new Error('No sections found') };
      }
      
      // Get IDs of all sections
      const sectionIds = sections.map(s => s.id);
      
      // Count lessons in those sections
      const { count, error } = await supabase
        .from('course_lessons')
        .select('*', { count: 'exact' })
        .in('section_id', sectionIds);
      
      return { count: count || 0, error };
    } catch (error) {
      console.error(`CourseProgressService: Error in countTotalLessons:`, error);
      return { count: 0, error: error as any };
    }
  }

  /**
   * Cuenta las lecciones completadas por un usuario en un curso
   */
  async countCompletedLessons(userId: string, courseId: string): Promise<SupabaseSimpleResponse> {
    console.log(`CourseProgressService: Counting completed lessons for user ${userId} and course ${courseId}`);
    try {
      return await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true);
    } catch (error) {
      console.error(`CourseProgressService: Error counting completed lessons:`, error);
      return { data: null, error };
    }
  }

  /**
   * Verifica si existe un registro de progreso para un curso
   */
  async checkCourseProgressExists(userId: string, courseId: string): Promise<SupabaseSimpleResponse> {
    console.log(`CourseProgressService: Checking if course progress exists for user ${userId} and course ${courseId}`);
    try {
      return await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();
    } catch (error) {
      console.error(`CourseProgressService: Error checking course progress:`, error);
      return { data: null, error };
    }
  }

  /**
   * Actualiza un registro existente de progreso de curso
   */
  async updateCourseProgressRecord(
    id: string, 
    data: Partial<CourseProgressItem>
  ): Promise<SupabaseSimpleResponse> {
    console.log(`CourseProgressService: Updating course progress record ${id}`, data);
    try {
      return await supabase
        .from('user_course_progress')
        .update(data)
        .eq('id', id);
    } catch (error) {
      console.error(`CourseProgressService: Error updating course progress:`, error);
      return { data: null, error };
    }
  }

  /**
   * Crea un nuevo registro de progreso de curso
   */
  async createCourseProgressRecord(data: CourseProgressItem): Promise<SupabaseSimpleResponse> {
    console.log(`CourseProgressService: Creating new course progress record`, data);
    try {
      // Remove id field if it exists as Supabase will generate it
      if (data.id) {
        delete data.id;
      }
      return await supabase
        .from('user_course_progress')
        .insert([data]);
    } catch (error) {
      console.error(`CourseProgressService: Error creating course progress:`, error);
      return { data: null, error };
    }
  }

  /**
   * Recupera el progreso completo del usuario para un curso específico
   */
  async fetchUserProgressData(courseId: string, userId: string): Promise<ProgressResult> {
    try {
      console.log(`CourseProgressService: Fetching user progress data for course ${courseId} and user ${userId}`);
      // Get course progress data
      const { data: progressData, error: progressError } = await this.getCourseProgress(userId, courseId);
      if (progressError) {
        console.error("CourseProgressService: Error fetching course progress:", progressError);
        return {
          progress: 0,
          completedLessons: {},
          completedQuizzes: {}
        };
      }

      // Get lesson progress data
      const { data: lessonProgressData, error: lessonProgressError } = await this.getLessonProgress(userId, courseId);
      if (lessonProgressError) {
        console.error("CourseProgressService: Error fetching lesson progress:", lessonProgressError);
        return {
          progress: progressData?.progress_percentage || 0,
          completedLessons: {},
          completedQuizzes: {}
        };
      }
      
      // Process response data
      const progress = progressData?.progress_percentage || 0;
      const completedLessonsMap: CompletedLessonsMap = {};
      const completedQuizzesMap: Record<string, boolean> = {};
      
      if (lessonProgressData && Array.isArray(lessonProgressData)) {
        lessonProgressData.forEach((item) => {
          if (item && item.completed) {
            // Crear clave estandarizada: courseId:lessonId  
            const lessonKey = `${courseId}:${item.lesson_id}`;
            completedLessonsMap[lessonKey] = true;

            // Para compatibilidad también mantenemos el formato más general
            completedLessonsMap[item.lesson_id] = true;
          }
        });
      }

      console.log(`CourseProgressService: Progress data retrieved: ${progress}%, completed lessons: `, 
        Object.keys(completedLessonsMap).length);
      
      return {
        progress,
        completedLessons: completedLessonsMap,
        completedQuizzes: completedQuizzesMap
      };
    } catch (error) {
      console.error("CourseProgressService: Error in fetchUserProgressData:", error);
      return {
        progress: 0,
        completedLessons: {},
        completedQuizzes: {}
      };
    }
  }

  /**
   * Marca una lección como completada y actualiza el progreso del curso
   */
  async markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<boolean> {
    try {
      console.log(`CourseProgressService: Marking lesson ${lessonId} as completed for user ${userId} in course ${courseId}`);
      // Verificar si ya existe un registro para esta lección
      const { data: existingProgress, error: checkError } = await this.checkLessonProgressExists(
        userId, 
        courseId, 
        lessonId
      );

      if (checkError) {
        console.error("CourseProgressService: Error checking lesson progress:", checkError);
        return false;
      }

      const now = new Date().toISOString();
      let success = false;

      if (existingProgress?.id) {
        console.log(`CourseProgressService: Found existing progress record with ID ${existingProgress.id}`);
        // Actualizar registro existente
        const { error: updateError } = await this.updateLessonProgress(
          existingProgress.id, 
          {
            completed: true,
            completed_at: now
          }
        );

        if (updateError) {
          console.error("CourseProgressService: Error updating lesson progress:", updateError);
          return false;
        }

        success = true;
      } else {
        // Crear nuevo registro
        const newProgress: LessonProgressItem = {
          id: '', // Generado por Supabase
          user_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          completed: true,
          completed_at: now
        };

        const { error: insertError } = await this.createLessonProgress(newProgress);

        if (insertError) {
          console.error("CourseProgressService: Error creating lesson progress:", insertError);
          return false;
        }
        
        success = true;
      }

      // Actualizar el progreso del curso
      if (success) {
        console.log(`CourseProgressService: Successfully marked lesson as completed, updating course progress...`);
        const updateResult = await this.updateCourseProgressData(userId, courseId);
        console.log(`CourseProgressService: Course progress updated after marking lesson: ${updateResult}`);
      }

      return success;
    } catch (error) {
      console.error("CourseProgressService: Error in markLessonComplete:", error);
      return false;
    }
  }

  /**
   * Guarda los resultados de un quiz y marca la lección como completa
   */
  async saveQuizResults(
    userId: string, 
    courseId: string, 
    lessonId: string, 
    score: number, 
    answers: Record<string, number>
  ): Promise<boolean> {
    try {
      console.log(`CourseProgressService: Saving quiz results for user ${userId}, lesson ${lessonId}, score ${score}`);
      // Primero marcamos la lección como completa
      const success = await this.markLessonComplete(userId, courseId, lessonId);
      
      if (success) {
        console.log(`CourseProgressService: Quiz results saved for user ${userId}, lesson ${lessonId}: Score ${score}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("CourseProgressService: Error in saveQuizResults:", error);
      return false;
    }
  }

  /**
   * Actualiza los datos de progreso del curso basados en lecciones completadas
   */
  async updateCourseProgressData(userId: string, courseId: string): Promise<boolean> {
    try {
      console.log(`CourseProgressService: Updating course progress data for user ${userId} and course ${courseId}`);
      // Contar lecciones totales y completadas
      const { count: totalLessons, error: countError } = await this.countTotalLessons(courseId);
      if (countError) {
        console.error("CourseProgressService: Error counting total lessons:", countError);
        return false;
      }

      const { data: completedLessonsData, error: completedError } = await this.countCompletedLessons(userId, courseId);
      if (completedError) {
        console.error("CourseProgressService: Error counting completed lessons:", completedError);
        return false;
      }

      const completedLessons = completedLessonsData?.length || 0;

      // Calcular porcentaje de progreso
      const progressPercentage = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      console.log(`CourseProgressService: Course progress calculated: ${completedLessons}/${totalLessons} = ${progressPercentage}%`);

      // Determinar si el curso está completo
      const isCompleted = totalLessons > 0 && completedLessons >= totalLessons;
      const now = new Date().toISOString();

      // Verificar si ya existe un registro para este curso
      const { data: existingProgress, error: checkError } = await this.checkCourseProgressExists(userId, courseId);
      if (checkError) {
        console.error("CourseProgressService: Error checking course progress:", checkError);
        return false;
      }

      if (existingProgress?.id) {
        console.log(`CourseProgressService: Found existing course progress record with ID ${existingProgress.id}`);
        // Actualizar registro existente
        const { error: updateError } = await this.updateCourseProgressRecord(
          existingProgress.id,
          {
            progress_percentage: progressPercentage,
            completed: isCompleted,
            completed_at: isCompleted ? now : null,
            // No actualizamos started_at para mantener la fecha original
          }
        );

        if (updateError) {
          console.error("CourseProgressService: Error updating course progress:", updateError);
          return false;
        }
      } else {
        // Crear nuevo registro
        const newProgress: CourseProgressItem = {
          user_id: userId,
          course_id: courseId,
          progress_percentage: progressPercentage,
          started_at: now,
          completed: isCompleted,
          completed_at: isCompleted ? now : null
        };

        const { error: insertError } = await this.createCourseProgressRecord(newProgress);

        if (insertError) {
          console.error("CourseProgressService: Error creating course progress:", insertError);
          return false;
        }
      }

      console.log(`CourseProgressService: Course progress updated: ${courseId}, User: ${userId}, Progress: ${progressPercentage}%, Completed: ${isCompleted}`);
      return true;
    } catch (error) {
      console.error("CourseProgressService: Error in updateCourseProgressData:", error);
      return false;
    }
  }
}

// Exportamos una única instancia del servicio para usar en toda la aplicación
export const courseProgressService = new CourseProgressService();
