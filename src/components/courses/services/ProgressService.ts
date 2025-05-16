
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
      console.log('ProgressService: No user session found, cannot get lesson progress');
      return null;
    }

    try {
      console.log(`ProgressService: Getting lesson progress for ${lessonId} and user ${userSession.id}`);
      
      // Intentamos obtener información del curso para esta lección
      const { data: lessonData, error: lessonError } = await courseProgressService.getLessonCourseInfo(lessonId);
      
      if (lessonError) {
        console.error('ProgressService: Error getting course info for lesson:', lessonError);
        return null;
      }
      
      const courseId = lessonData?.course_sections?.course_id;
      
      if (!courseId) {
        console.log(`ProgressService: Could not determine course_id for lesson ${lessonId}`);
        // Intentamos obtener el progreso sin courseId como fallback
        const result = await courseProgressService.fetchLessonProgressByLessonId(userSession.id, lessonId);
        console.log('ProgressService: Fallback lesson progress result:', result);
        return result.data;
      }
      
      console.log(`ProgressService: Found courseId ${courseId} for lesson ${lessonId}`);
      
      // Obtenemos el progreso usando courseProgressService
      const { data, error } = await courseProgressService.checkLessonProgressExists(
        userSession.id, 
        courseId, 
        lessonId
      );
      
      if (error) {
        console.error('ProgressService: Error fetching lesson progress:', error);
        return null;
      }
      
      console.log('ProgressService: Lesson progress data:', data);
      return data || null;
    } catch (error) {
      console.error('ProgressService: Error in getLessonProgress:', error);
      return null;
    }
  };

  /**
   * Obtiene el progreso de un curso específico
   */
  const getCourseProgress = async (courseId: string) => {
    if (!userSession) {
      console.log('ProgressService: No user session found, cannot get course progress');
      return null;
    }

    try {
      console.log(`ProgressService: Getting course progress for ${courseId} and user ${userSession.id}`);
      const { data, error } = await courseProgressService.getCourseProgress(userSession.id, courseId);
      
      if (error) {
        console.error('ProgressService: Error fetching course progress:', error);
        return null;
      }
      
      console.log('ProgressService: Course progress data:', data);
      return data || null;
    } catch (error) {
      console.error('ProgressService: Error fetching course progress:', error);
      return null;
    }
  };

  /**
   * Marca una lección como completada
   */
  const markLessonAsCompleted = async (lessonId: string, courseId?: string) => {
    if (!userSession) {
      console.log("ProgressService: Cannot mark lesson as completed: no user session");
      toast({
        title: "No autorizado",
        description: "Debes iniciar sesión para marcar la lección como completada.",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log(`ProgressService: Marking lesson ${lessonId} as completed for user ${userSession.id}`);
      
      // Si no tenemos el courseId, intentar determinarlo
      let effectiveCourseId = courseId;
      if (!effectiveCourseId) {
        console.log("ProgressService: No course ID provided, attempting to determine it from lesson");
        const { data: lessonData, error: lessonError } = await courseProgressService.getLessonCourseInfo(lessonId);
        
        if (lessonError) {
          console.error('ProgressService: Error getting course info for lesson:', lessonError);
          toast({
            title: "Error",
            description: "No se pudo determinar el curso de la lección.",
            variant: "destructive",
          });
          return false;
        }
        
        effectiveCourseId = lessonData?.course_sections?.course_id;
        console.log(`ProgressService: Determined course ID: ${effectiveCourseId}`);
      }

      if (!effectiveCourseId) {
        console.error('ProgressService: Could not determine course_id for lesson:', lessonId);
        toast({
          title: "Error",
          description: "No se pudo determinar el curso de la lección.",
          variant: "destructive",
        });
        return false;
      }

      console.log(`ProgressService: Marking lesson ${lessonId} complete in course ${effectiveCourseId}`);
      
      // Usar el servicio centralizado para marcar la lección como completada
      const success = await courseProgressService.markLessonComplete(
        userSession.id, 
        effectiveCourseId, 
        lessonId
      );
      
      if (success) {
        console.log('ProgressService: Lesson marked as completed successfully');
        
        // Actualizar el progreso del curso después de marcar la lección
        const progressUpdated = await courseProgressService.updateCourseProgressData(
          userSession.id,
          effectiveCourseId
        );
        
        console.log(`ProgressService: Course progress updated: ${progressUpdated}`);
        
        return true;
      } else {
        console.error('ProgressService: Failed to mark lesson as completed');
        toast({
          title: "Error",
          description: "No se pudo marcar la lección como completada.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('ProgressService: Error marking lesson as completed:', error);
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
      console.log('ProgressService: No user session found, cannot update course progress');
      return false;
    }

    try {
      console.log(`ProgressService: Updating course progress for ${courseId} and user ${userSession.id}`);
      const success = await courseProgressService.updateCourseProgressData(userSession.id, courseId);
      console.log(`ProgressService: Course progress update result: ${success}`);
      return success;
    } catch (error) {
      console.error('ProgressService: Error updating course progress:', error);
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
