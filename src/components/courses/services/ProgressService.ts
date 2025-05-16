
import { courseProgressService } from '@/services/course-progress-service';
import { useUser } from '@/contexts/UserContext';
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { HybridCourseService } from './HybridCourseService';

export function useProgressService() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUserStats } = useUser();

  // Función para determinar el ID del curso a partir del ID de la lección
  const getCourseIdFromLesson = useCallback(async (lessonId: string) => {
    try {
      // Primero intentamos obtener el ID del curso a partir de la lección
      const lessonData = await HybridCourseService.getLessonById(lessonId);
      if (!lessonData) {
        console.error("ProgressService: Lesson not found:", lessonId);
        return null;
      }

      // Si tenemos el ID de la sección, obtenemos el curso
      if (lessonData.section_id) {
        const sectionData = await HybridCourseService.getSectionById(lessonData.section_id);
        if (sectionData && sectionData.course_id) {
          return sectionData.course_id;
        }
      }

      // Fallback: consultamos directamente a la base de datos
      const courseInfo = await courseProgressService.getLessonCourseInfo(lessonId);
      if (courseInfo.data?.course_sections?.course_id) {
        return courseInfo.data.course_sections.course_id;
      }

      console.warn(`ProgressService: Could not determine course ID for lesson ${lessonId}`);
      return null;
    } catch (error) {
      console.error("Error getting course ID from lesson:", error);
      return null;
    }
  }, []);

  /**
   * Obtiene el progreso de una lección específica
   */
  const getLessonProgress = useCallback(async (lessonId: string) => {
    if (!user) return null;
    
    try {
      const response = await courseProgressService.fetchLessonProgressByLessonId(user.id, lessonId);
      return response.data;
    } catch (error) {
      console.error("Error getting lesson progress:", error);
      return null;
    }
  }, [user]);

  /**
   * Marca una lección como completada
   * @param lessonId ID de la lección a marcar como completada
   * @param moduleId Opcional: ID del módulo/sección (para actualización de estado en UI)
   */
  const markLessonAsCompleted = useCallback(async (lessonId: string, moduleId?: string) => {
    if (!user) {
      console.error("ProgressService: No user logged in");
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log(`ProgressService: Marking lesson ${lessonId} as completed`);
      
      // 1. Determinar el curso al que pertenece esta lección
      const courseId = await getCourseIdFromLesson(lessonId);
      
      if (!courseId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo determinar el curso al que pertenece esta lección"
        });
        return false;
      }
      
      console.log(`ProgressService: Lesson ${lessonId} belongs to course ${courseId}`);
      
      // 2. Marcar la lección como completada
      const success = await courseProgressService.markLessonComplete(
        user.id,
        courseId,
        lessonId
      );
      
      if (success) {
        console.log(`ProgressService: Successfully marked lesson ${lessonId} as completed`);
        
        // 3. Actualizar el progreso global del usuario
        await refreshUserStats();
        
        toast({
          title: "Lección completada",
          description: "Se ha guardado tu progreso correctamente"
        });
        return true;
      } else {
        console.error(`ProgressService: Failed to mark lesson ${lessonId} as completed`);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo guardar el progreso de la lección"
        });
        return false;
      }
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al guardar el progreso"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, getCourseIdFromLesson, refreshUserStats]);

  return {
    markLessonAsCompleted,
    getLessonProgress,
    isLoading
  };
}
