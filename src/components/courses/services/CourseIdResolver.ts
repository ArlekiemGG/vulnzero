
import { HybridCourseService } from './HybridCourseService';
import { normalizeId, isValidUUID } from '@/utils/uuid-generator';

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
      // Normalizamos el ID de la lección a UUID si es necesario
      const normalizedLessonId = normalizeId(lessonId);
      console.log(`CourseIdResolver: Checking lesson ${lessonId} (normalized: ${normalizedLessonId})`);
      
      // 1. Obtener información de la lección
      const lessonData = await HybridCourseService.getLessonById(lessonId);
      if (!lessonData) {
        console.error("CourseIdResolver: Lesson not found:", lessonId);
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
      const normalizedSectionId = normalizeId(sectionId);
      console.log(`CourseIdResolver: Looking for course with section ${sectionId} (normalized: ${normalizedSectionId})`);
      
      // Obtener todos los cursos y buscar la sección que coincide
      const allCourses = await HybridCourseService.getAllCourses();
      
      for (const course of allCourses) {
        const courseId = course.id;
        const normalizedCourseId = normalizeId(courseId);
        
        const sections = await HybridCourseService.getCourseSections(courseId);
        const matchingSection = sections.find(section => {
          const secId = normalizeId(section.id);
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
        const normalizedUrlCourseId = normalizeId(courseIdFromUrl);
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
