
import { courseProgressService } from '@/services/course-progress-service';
import { useUser } from '@/contexts/UserContext';
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { HybridCourseService } from './HybridCourseService';
import { generateUUID, isValidUUID } from '@/utils/uuid-generator';

export function useProgressService() {
  // Instead of destructuring user directly, we'll get the whole context
  const userContext = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUserStats } = useUser();

  // Función para determinar el ID del curso a partir del ID de la lección
  const getCourseIdFromLesson = useCallback(async (lessonId: string) => {
    try {
      // Normalizamos el ID de la lección a UUID si es necesario
      const normalizedLessonId = isValidUUID(lessonId) ? lessonId : generateUUID(lessonId);
      console.log(`ProgressService: Checking lesson ${lessonId} (normalized: ${normalizedLessonId})`);
      
      // Primero intentamos obtener el ID del curso a partir de la lección
      const lessonData = await HybridCourseService.getLessonById(lessonId);
      if (!lessonData) {
        console.error("ProgressService: Lesson not found:", lessonId);
        return null;
      }

      // Si tenemos el ID de la sección, obtenemos el curso
      if (lessonData.section_id) {
        // Normalizamos el ID de la sección también
        const sectionId = lessonData.section_id;
        const normalizedSectionId = isValidUUID(sectionId) ? sectionId : generateUUID(sectionId);
        console.log(`ProgressService: Section ID ${sectionId} (normalized: ${normalizedSectionId})`);
        
        // We'll get all sections for all courses and find the matching one
        const allCourses = await HybridCourseService.getAllCourses();
        
        for (const course of allCourses) {
          const courseId = course.id;
          const normalizedCourseId = isValidUUID(courseId) ? courseId : generateUUID(courseId);
          console.log(`ProgressService: Checking course ${courseId} (normalized: ${normalizedCourseId})`);
          
          const sections = await HybridCourseService.getCourseSections(courseId);
          const matchingSection = sections.find(section => {
            const secId = isValidUUID(section.id) ? section.id : generateUUID(section.id);
            return secId === normalizedSectionId || section.id === sectionId;
          });
          
          if (matchingSection) {
            console.log(`ProgressService: Found course ${courseId} for lesson ${lessonId}`);
            return normalizedCourseId;
          }
        }
      }

      // Fallback: consultamos directamente a la base de datos
      const courseInfo = await courseProgressService.getLessonCourseInfo(normalizedLessonId);
      if (courseInfo.data?.course_sections?.course_id) {
        return courseInfo.data.course_sections.course_id;
      }

      // Último recurso: extraer de la URL actual
      const urlParts = window.location.pathname.split('/');
      const urlHash = window.location.hash;
      let courseIdFromUrl = null;
      
      // Buscar en el patrón de URL normal
      const courseIndex = urlParts.indexOf('courses') + 1;
      if (courseIndex > 0 && courseIndex < urlParts.length) {
        courseIdFromUrl = urlParts[courseIndex];
      }
      
      // Buscar en el patrón de hash (#/courses/...)
      if (!courseIdFromUrl && urlHash) {
        const hashParts = urlHash.split('/');
        const hashCourseIndex = hashParts.indexOf('courses') + 1;
        if (hashCourseIndex > 0 && hashCourseIndex < hashParts.length) {
          courseIdFromUrl = hashParts[hashCourseIndex];
        }
      }
      
      if (courseIdFromUrl) {
        console.log(`ProgressService: Extracted course ID from URL: ${courseIdFromUrl}`);
        const normalizedUrlCourseId = isValidUUID(courseIdFromUrl) ? courseIdFromUrl : generateUUID(courseIdFromUrl);
        console.log(`ProgressService: Normalized URL course ID: ${normalizedUrlCourseId}`);
        return normalizedUrlCourseId;
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
      // Normalizamos el ID de la lección a UUID si es necesario
      const normalizedLessonId = isValidUUID(lessonId) ? lessonId : generateUUID(lessonId);
      console.log(`ProgressService: Checking progress for lesson ${lessonId} (normalized: ${normalizedLessonId})`);
      
      const response = await courseProgressService.fetchLessonProgressByLessonId(userContext.user.id, normalizedLessonId);
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
      
      // Normalizamos los IDs a UUIDs si es necesario
      const normalizedLessonId = isValidUUID(lessonId) ? lessonId : generateUUID(lessonId);
      console.log(`ProgressService: Normalized lessonId from ${lessonId} to ${normalizedLessonId}`);
      
      // 1. Determinar el curso al que pertenece esta lección
      let courseId = await getCourseIdFromLesson(lessonId);
      
      if (!courseId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo determinar el curso al que pertenece esta lección"
        });
        setIsLoading(false);
        return false;
      }
      
      // Asegurarse de que el courseId también sea un UUID válido
      const normalizedCourseId = isValidUUID(courseId) ? courseId : generateUUID(courseId);
      console.log(`ProgressService: Lesson ${normalizedLessonId} belongs to course ${normalizedCourseId}`);
      
      // 2. Marcar la lección como completada
      const success = await courseProgressService.markLessonComplete(
        userContext.user.id,
        normalizedCourseId,
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
      console.error("Error marking lesson as completed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al guardar el progreso"
      });
      setIsLoading(false);
      return false;
    }
  }, [userContext.user, getCourseIdFromLesson, refreshUserStats]);

  return {
    markLessonAsCompleted,
    getLessonProgress,
    isLoading
  };
}
