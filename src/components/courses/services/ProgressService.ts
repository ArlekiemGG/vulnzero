
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { courseProgressService } from '@/services/course-progress-service';

/**
 * Hook para gestionar el progreso de cursos y lecciones
 * Utiliza el servicio centralizado courseProgressService
 */
export function useProgressService() {
  const { user: userSession } = useAuth();

  /**
   * Obtiene el progreso de una lección específica
   */
  const getLessonProgress = async (lessonId: string) => {
    if (!userSession) {
      console.log('No user session found, cannot get lesson progress');
      return null;
    }

    try {
      console.log(`Getting lesson progress for ${lessonId} and user ${userSession.id}`);
      
      // Buscamos el course_id para esta lección (requerido para el formato de clave estandarizado)
      // Esto es necesario para compatibilidad con el código existente que solo pasa el lessonId
      let courseId = null;
      
      // Intentar determinar el curso de la lección
      const { data: lessonData, error: lessonError } = await courseProgressService.getLessonCourseInfo(lessonId);
      if (lessonError) {
        console.error('Error getting course info for lesson:', lessonError);
      } else if (lessonData) {
        courseId = lessonData.course_id;
      }
      
      if (!courseId) {
        console.log(`Could not determine course_id for lesson ${lessonId}`);
        // Intentamos obtener el progreso sin courseId como fallback
        const result = await courseProgressService.fetchLessonProgressByLessonId(userSession.id, lessonId);
        return result;
      }
      
      // Obtenemos el progreso usando courseProgressService
      const { data, error } = await courseProgressService.checkLessonProgressExists(
        userSession.id, 
        courseId, 
        lessonId
      );
      
      if (error) {
        console.error('Error fetching lesson progress:', error);
        return null;
      }
      
      return data || null;
    } catch (error) {
      console.error('Error in getLessonProgress:', error);
      return null;
    }
  };

  /**
   * Obtiene el progreso de un curso específico
   */
  const getCourseProgress = async (courseId: string) => {
    if (!userSession) {
      console.log('No user session found, cannot get course progress');
      return null;
    }

    try {
      console.log(`Getting course progress for ${courseId} and user ${userSession.id}`);
      const { data, error } = await courseProgressService.getCourseProgress(userSession.id, courseId);
      
      if (error) {
        console.error('Error fetching course progress:', error);
        return null;
      }
      
      return data || null;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return null;
    }
  };

  /**
   * Marca una lección como completada
   */
  const markLessonAsCompleted = async (lessonId: string, courseId?: string) => {
    if (!userSession) {
      toast({
        title: "No autorizado",
        description: "Debes iniciar sesión para marcar la lección como completada.",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log(`Marking lesson ${lessonId} as completed for user ${userSession.id}`);
      
      // Si no tenemos el courseId, intentar determinarlo
      let effectiveCourseId = courseId;
      if (!effectiveCourseId) {
        const { data: lessonData, error: lessonError } = await courseProgressService.getLessonCourseInfo(lessonId);
        
        if (lessonError) {
          console.error('Error getting course info for lesson:', lessonError);
          toast({
            title: "Error",
            description: "No se pudo determinar el curso de la lección.",
            variant: "destructive",
          });
          return false;
        }
        
        effectiveCourseId = lessonData?.course_id;
      }

      if (!effectiveCourseId) {
        console.error('Could not determine course_id for lesson:', lessonId);
        toast({
          title: "Error",
          description: "No se pudo determinar el curso de la lección.",
          variant: "destructive",
        });
        return false;
      }

      // Usar el servicio centralizado para marcar la lección como completada
      const success = await courseProgressService.markLessonComplete(
        userSession.id, 
        effectiveCourseId, 
        lessonId
      );
      
      if (success) {
        toast({
          title: "Lección completada",
          description: "¡Has completado esta lección!",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "No se pudo marcar la lección como completada.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al marcar la lección como completada.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Actualiza el progreso de un curso
   */
  const updateCourseProgress = async (courseId: string) => {
    if (!userSession) {
      return false;
    }

    try {
      console.log(`Updating course progress for ${courseId} and user ${userSession.id}`);
      const success = await courseProgressService.updateCourseProgressData(userSession.id, courseId);
      return success;
    } catch (error) {
      console.error('Error updating course progress:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el progreso del curso.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    getLessonProgress,
    markLessonAsCompleted,
    updateCourseProgress,
    getCourseProgress,
  };
}

export default useProgressService;
