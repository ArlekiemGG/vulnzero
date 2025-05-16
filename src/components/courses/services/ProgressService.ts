
import { courseProgressService } from '@/services/course-progress-service';
import { useUser } from '@/contexts/UserContext';
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { HybridCourseService } from './HybridCourseService';
import { generateUUID } from '@/utils/uuid-generator';

export function useProgressService() {
  // Instead of destructuring user directly, we'll get the whole context
  const userContext = useUser();
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
        // Let's use a different approach since getSectionById doesn't exist
        // We'll get all sections for all courses and find the matching one
        const allCourses = await HybridCourseService.getAllCourses();
        
        for (const course of allCourses) {
          const sections = await HybridCourseService.getCourseSections(course.id);
          const matchingSection = sections.find(section => section.id === lessonData.section_id);
          
          if (matchingSection) {
            return course.id;
          }
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
    // Access user from the context object
    if (!userContext.user) return null;
    
    try {
      const response = await courseProgressService.fetchLessonProgressByLessonId(userContext.user.id, lessonId);
      return response.data;
    } catch (error) {
      console.error("Error getting lesson progress:", error);
      return null;
    }
  }, [userContext.user]);

  /**
   * Marca una lección como completada
   * @param lessonId ID de la lección a marcar como completada
   * @param moduleId Opcional: ID del módulo/sección (para actualización de estado en UI)
   */
  const markLessonAsCompleted = useCallback(async (lessonId: string, moduleId?: string) => {
    // Access user from the context object
    if (!userContext.user) {
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
        userContext.user.id,
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
  }, [userContext.user, getCourseIdFromLesson, refreshUserStats]);

  return {
    markLessonAsCompleted,
    getLessonProgress,
    isLoading
  };
}
