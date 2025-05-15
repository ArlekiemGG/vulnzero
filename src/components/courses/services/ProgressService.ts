
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CourseProgress, LessonProgress } from './CourseService';

export const useProgressService = () => {
  const { user } = useAuth();

  const getCourseProgress = async (courseId: string): Promise<CourseProgress | null> => {
    if (!user) {
      toast({
        title: "Acceso denegado",
        description: "Debes iniciar sesión para ver tu progreso",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return null;
    }
  };

  const getLessonProgress = async (lessonId: string): Promise<LessonProgress | null> => {
    if (!user) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      return null;
    }
  };

  const markLessonAsCompleted = async (lessonId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Acceso denegado",
        description: "Debes iniciar sesión para guardar tu progreso",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Verificar si ya existe un registro de progreso para esta lección
      const { data: existingProgress } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (existingProgress) {
        // Actualizar el registro existente
        const { error } = await supabase
          .from('user_lesson_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
        
        if (error) throw error;
      } else {
        // Crear un nuevo registro
        const { error } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }

      // Actualizar el progreso del curso
      await updateCourseProgress(lessonId);
      
      toast({
        title: "¡Progreso guardado!",
        description: "Has completado esta lección",
      });
      
      return true;
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar tu progreso",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCourseProgress = async (lessonId: string): Promise<void> => {
    if (!user) return;

    try {
      // Obtener información de la lección para saber a qué sección pertenece
      const { data: lesson } = await supabase
        .from('course_lessons')
        .select('section_id')
        .eq('id', lessonId)
        .single();

      if (!lesson) return;

      // Obtener la sección para saber a qué curso pertenece
      const { data: section } = await supabase
        .from('course_sections')
        .select('course_id')
        .eq('id', lesson.section_id)
        .single();

      if (!section) return;

      const courseId = section.course_id;

      // Preparar la subconsulta para obtener las secciones del curso
      const sectionsQuery = supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', courseId);
        
      // Contar el total de lecciones del curso
      const { count: totalLessons } = await supabase
        .from('course_lessons')
        .select('*', { count: 'exact', head: true })
        .in('section_id', await sectionsQuery);

      // Preparar la subconsulta para obtener las lecciones de las secciones del curso
      const lessonsQuery = supabase
        .from('course_lessons')
        .select('id')
        .in('section_id', await sectionsQuery);
        
      // Contar lecciones completadas
      const { count: completedLessons } = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('lesson_id', await lessonsQuery);

      if (!totalLessons || totalLessons === 0) return;

      // Calcular porcentaje de progreso
      const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
      const completed = progressPercentage === 100;

      // Verificar si ya existe un registro de progreso para este curso
      const { data: existingProgress } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      const updateData = {
        progress_percentage: progressPercentage,
        last_lesson_id: lessonId,
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null
      };

      if (existingProgress) {
        // Actualizar el registro existente
        await supabase
          .from('user_course_progress')
          .update(updateData)
          .eq('id', existingProgress.id);
      } else {
        // Crear un nuevo registro
        await supabase
          .from('user_course_progress')
          .insert({
            user_id: user.id,
            course_id: courseId,
            ...updateData
          });
      }
    } catch (error) {
      console.error('Error updating course progress:', error);
    }
  };

  return {
    getCourseProgress,
    getLessonProgress,
    markLessonAsCompleted
  };
};
