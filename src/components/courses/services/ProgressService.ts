
import { courseProgressService } from '@/services/course-progress-service';
import { useUser } from '@/contexts/UserContext';
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { normalizeId, isValidUUID } from '@/utils/uuid-generator';
import { CourseIdResolver } from './CourseIdResolver';

export function useProgressService() {
  const userContext = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUserStats } = useUser();

  /**
   * Obtiene el progreso de una lección específica
   */
  const getLessonProgress = useCallback(async (lessonId: string) => {
    if (!userContext.user) return null;
    
    try {
      let lessonIdToCheck = lessonId;
      
      // Comprobamos si el ID es un UUID válido, sino lo normalizamos
      if (!isValidUUID(lessonId)) {
        lessonIdToCheck = normalizeId(lessonId);
      }
      
      console.log(`ProgressService: Checking progress for lesson ${lessonId} (checking with: ${lessonIdToCheck})`);
      
      const response = await courseProgressService.fetchLessonProgressByLessonId(userContext.user.id, lessonIdToCheck);
      
      // Si no encontramos progreso con el ID normalizado, intentamos con el original
      if (!response.data && lessonIdToCheck !== lessonId) {
        console.log(`ProgressService: No progress found with normalized ID, trying original ID ${lessonId}`);
        const originalResponse = await courseProgressService.fetchLessonProgressByLessonId(userContext.user.id, lessonId);
        return originalResponse.data;
      }
      
      return response.data;
    } catch (error) {
      console.error("ProgressService: Error getting lesson progress:", error);
      return null;
    }
  }, [userContext.user]);

  /**
   * Marca una lección como completada
   * @param lessonId ID de la lección a marcar como completada
   * @param moduleId Opcional: ID del módulo/sección (para actualización de estado en UI)
   */
  const markLessonAsCompleted = useCallback(async (lessonId: string, moduleId?: string) => {
    if (!userContext.user) {
      console.error("ProgressService: No user logged in");
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log(`ProgressService: Marking lesson ${lessonId} as completed`);
      
      // 1. Determinar el curso al que pertenece esta lección
      const courseId = await CourseIdResolver.getCourseIdFromLesson(lessonId);
      
      if (!courseId) {
        console.error(`ProgressService: Could not determine course ID for lesson ${lessonId}`);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo determinar el curso al que pertenece esta lección"
        });
        setIsLoading(false);
        return false;
      }
      
      // El courseId ya viene normalizado desde CourseIdResolver
      console.log(`ProgressService: Lesson ${lessonId} belongs to course ${courseId}`);
      
      // 2. Marcar la lección como completada - pasamos el lessonId sin normalizar
      // El servicio se encargará de determinar cómo guardarlo
      const success = await courseProgressService.markLessonComplete(
        userContext.user.id,
        courseId,
        lessonId
      );
      
      if (success) {
        console.log(`ProgressService: Successfully marked lesson ${lessonId} as completed`);
        
        // 3. Actualizar el progreso global del usuario
        await refreshUserStats();
        console.log("ProgressService: User stats refreshed");
        
        toast({
          title: "Lección completada",
          description: "Se ha guardado tu progreso correctamente"
        });
        setIsLoading(false);
        return true;
      } else {
        console.error(`ProgressService: Failed to mark lesson ${lessonId} as completed`);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo guardar el progreso de la lección"
        });
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("ProgressService: Error marking lesson as completed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al guardar el progreso"
      });
      setIsLoading(false);
      return false;
    }
  }, [userContext.user, refreshUserStats]);

  return {
    markLessonAsCompleted,
    getLessonProgress,
    isLoading
  };
}
