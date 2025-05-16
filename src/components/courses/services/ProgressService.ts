
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchUserProgressData, 
  markLessonComplete, 
  updateCourseProgressData 
} from '@/services/course-progress';
import type { 
  CourseProgressItem as CourseProgress,
  LessonProgressItem as LessonProgress
} from '@/services/course-progress/types';

/**
 * Hook para gestionar el progreso de cursos
 * Este servicio ahora utiliza las funciones centrales de progreso del curso
 * para evitar duplicación de código
 */
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
      // Usamos la función centralizada para obtener el progreso
      const progressResult = await fetchUserProgressData(courseId, user.id);
      
      // Si no hay datos de progreso en el curso, retornamos null
      if (!progressResult || progressResult.progress === 0) {
        return null;
      }
      
      // Transformamos la respuesta al formato esperado por los componentes existentes
      return {
        user_id: user.id,
        course_id: courseId,
        progress_percentage: progressResult.progress,
        completed: progressResult.progress === 100,
        completed_at: progressResult.progress === 100 ? new Date().toISOString() : null
      };
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
      // Necesitamos obtener el courseId para la lección primero
      const { data: lesson } = await supabase
        .from('course_lessons')
        .select('section_id')
        .eq('id', lessonId)
        .single();
      
      if (!lesson) return null;

      // Obtenemos el course_id a través de la sección
      const { data: section } = await supabase
        .from('course_sections')
        .select('course_id')
        .eq('id', lesson.section_id)
        .single();
        
      if (!section) return null;
        
      const courseId = section.course_id;
      
      // Usamos las funciones centralizadas para verificar el progreso
      const { data: existingProgress } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      return existingProgress;
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
      // Necesitamos obtener el courseId para la lección
      const { data: lesson } = await supabase
        .from('course_lessons')
        .select('section_id')
        .eq('id', lessonId)
        .single();
      
      if (!lesson) {
        throw new Error('Lesson not found');
      }
      
      // Obtenemos el course_id a través de la sección
      const { data: section } = await supabase
        .from('course_sections')
        .select('course_id')
        .eq('id', lesson.section_id)
        .single();
        
      if (!section) {
        throw new Error('Section not found');
      }
      
      const courseId = section.course_id;
      
      // Usamos la función centralizada de marcado de lección
      const success = await markLessonComplete(user.id, courseId, lessonId);
      
      if (success) {
        toast({
          title: "¡Progreso guardado!",
          description: "Has completado esta lección",
        });
      } else {
        throw new Error('No se pudo guardar el progreso');
      }
      
      return success;
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

  return {
    getCourseProgress,
    getLessonProgress,
    markLessonAsCompleted
  };
};

// Necesitamos importar supabase para algunas operaciones de búsqueda que aún requieren consultas directas
import { supabase } from '@/integrations/supabase/client';
