
import { HybridCourseService } from './HybridCourseService';
import { normalizeId, isValidUUID } from '@/utils/uuid-generator';
import { supabase } from '@/integrations/supabase/client';

/**
 * Servicio especializado en resolver IDs de cursos a partir de IDs de lecciones
 */
export const CourseIdResolver = {
  /**
   * Determina el ID del curso al que pertenece una lección
   * @param lessonId ID de la lección
   * @returns ID del curso (normalizado a UUID) o null si no se puede determinar
   */
  getCourseIdFromLesson: async (lessonId: string): Promise<string | null> => {
    try {
      console.log(`CourseIdResolver: Getting course ID for lesson ${lessonId}`);
      
      // Normalizamos el ID de la lección a UUID si es necesario
      let normalizedLessonId = lessonId;
      if (!isValidUUID(lessonId)) {
        normalizedLessonId = normalizeId(lessonId);
        console.log(`CourseIdResolver: Normalized lesson ID from ${lessonId} to ${normalizedLessonId}`);
      }
      
      // 1. Obtener información de la lección
      const lessonData = await HybridCourseService.getLessonById(lessonId);
      if (!lessonData) {
        console.error("CourseIdResolver: Lesson not found:", lessonId);
        
        // Intentar con ID normalizado si es diferente
        if (normalizedLessonId !== lessonId) {
          console.log(`CourseIdResolver: Trying with normalized ID ${normalizedLessonId}`);
          const normalizedLessonData = await HybridCourseService.getLessonById(normalizedLessonId);
          if (normalizedLessonData) {
            if (normalizedLessonData.section_id) {
              const courseId = await CourseIdResolver.getCourseIdFromSection(normalizedLessonData.section_id);
              if (courseId) {
                console.log(`CourseIdResolver: Found course_id ${courseId} for normalized lesson ID`);
                return courseId;
              }
            }
          }
        }
        
        // Si aún no encontramos nada, intentamos extraer del URL
        const urlCourseId = CourseIdResolver.extractCourseIdFromUrl();
        if (urlCourseId) {
          console.log(`CourseIdResolver: Extracted course_id ${urlCourseId} from URL`);
          return urlCourseId;
        }
        
        return null;
      }

      // 2. Si tenemos el ID de la sección, obtener el curso
      if (lessonData.section_id) {
        console.log(`CourseIdResolver: Found section_id ${lessonData.section_id} for lesson ${lessonId}`);
        const courseId = await CourseIdResolver.getCourseIdFromSection(lessonData.section_id);
        if (courseId) {
          console.log(`CourseIdResolver: Found course_id ${courseId} for section ${lessonData.section_id}`);
          return courseId;
        }
      }

      // 3. Extraer de la URL actual si es posible
      const urlCourseId = CourseIdResolver.extractCourseIdFromUrl();
      if (urlCourseId) {
        console.log(`CourseIdResolver: Extracted course_id ${urlCourseId} from URL`);
        return urlCourseId;
      }

      console.warn(`CourseIdResolver: Could not determine course ID for lesson ${lessonId}`);
      return null;
    } catch (error) {
      console.error("CourseIdResolver: Error getting course ID from lesson:", error);
      return null;
    }
  },

  /**
   * Obtiene el ID del curso al que pertenece una sección
   * @param sectionId ID de la sección
   * @returns ID del curso (normalizado a UUID) o null si no se puede determinar
   */
  getCourseIdFromSection: async (sectionId: string): Promise<string | null> => {
    try {
      // First check if the sectionId is a valid UUID or normalize it
      let normalizedSectionId = sectionId;
      if (!isValidUUID(sectionId)) {
        normalizedSectionId = normalizeId(sectionId);
        console.log(`CourseIdResolver: Normalized section ID from ${sectionId} to ${normalizedSectionId}`);
      }
      
      // Try to get section directly from database first
      const { data: sectionData, error: sectionError } = await supabase
        .from('course_sections')
        .select('course_id')
        .eq('id', normalizedSectionId)
        .maybeSingle();
        
      if (!sectionError && sectionData && sectionData.course_id) {
        console.log(`CourseIdResolver: Found course_id ${sectionData.course_id} directly from database`);
        return sectionData.course_id;
      }
      
      // If not found in database, try with HybridCourseService
      console.log(`CourseIdResolver: Looking for course with section ${sectionId} (normalized: ${normalizedSectionId})`);
      
      // Obtener todos los cursos y buscar la sección que coincide
      const allCourses = await HybridCourseService.getAllCourses();
      
      for (const course of allCourses) {
        const courseId = course.id;
        const normalizedCourseId = isValidUUID(courseId) ? courseId : normalizeId(courseId);
        
        const sections = await HybridCourseService.getCourseSections(courseId);
        const matchingSection = sections.find(section => {
          const secId = isValidUUID(section.id) ? section.id : normalizeId(section.id);
          return secId === normalizedSectionId || section.id === sectionId;
        });
        
        if (matchingSection) {
          console.log(`CourseIdResolver: Found course ${normalizedCourseId} for section ${normalizedSectionId}`);
          return normalizedCourseId;
        }
      }
      
      return null;
    } catch (error) {
      console.error("CourseIdResolver: Error getting course ID from section:", error);
      return null;
    }
  },

  /**
   * Extrae el ID del curso de la URL actual
   * @returns ID del curso (normalizado a UUID) o null si no se puede extraer
   */
  extractCourseIdFromUrl: (): string | null => {
    try {
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
        console.log(`CourseIdResolver: Extracted course ID from URL: ${courseIdFromUrl}`);
        // Only normalize if it's not already a UUID
        const normalizedUrlCourseId = isValidUUID(courseIdFromUrl) ? courseIdFromUrl : normalizeId(courseIdFromUrl);
        console.log(`CourseIdResolver: Normalized course ID from URL: ${normalizedUrlCourseId}`);
        return normalizedUrlCourseId;
      }
      
      console.log("CourseIdResolver: No course ID found in URL");
      return null;
    } catch (error) {
      console.error("CourseIdResolver: Error extracting course ID from URL:", error);
      return null;
    }
  }
};
