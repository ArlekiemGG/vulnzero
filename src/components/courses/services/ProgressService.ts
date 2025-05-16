
import { courseProgressService } from '@/services/course-progress-service';
import { useUser } from '@/contexts/UserContext';
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { HybridCourseService } from './HybridCourseService';
import { normalizeId } from '@/utils/uuid-generator';
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
      // Normalizamos el ID de la lección a UUID
      const normalizedLessonId = normalizeId(lessonId);
      console.log(`ProgressService: Checking progress for lesson ${lessonId} (normalized: ${normalizedLessonId})`);
      
      const response = await courseProgressService.fetchLessonProgressByLessonId(userContext.user.id, normalizedLessonId);
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
      
      // Normalizamos el ID de la lección a UUID
      const normalizedLessonId = normalizeId(lessonId);
      console.log(`ProgressService: Normalized lessonId from ${lessonId} to ${normalizedLessonId}`);
      
      // 1. Determinar el curso al que pertenece esta lección
      const courseId = await CourseIdResolver.getCourseIdFromLesson(lessonId);
      
      if (!courseId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo determinar el curso al que pertenece esta lección"
        });
        setIsLoading(false);
        return false;
      }
      
      // El courseId ya viene normalizado desde CourseIdResolver
      console.log(`ProgressService: Lesson ${normalizedLessonId} belongs to course ${courseId}`);
      
      // 2. Marcar la lección como completada
      const success = await courseProgressService.markLessonComplete(
        userContext.user.id,
        courseId,
        normalizedLessonId
      );
      
      if (success) {
        console.log(`ProgressService: Successfully marked lesson ${lessonId} as completed`);
        
        // 3. Actualizar el progreso global del usuario
        await refreshUserStats();
        
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
