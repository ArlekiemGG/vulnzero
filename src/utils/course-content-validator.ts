
import { findCourseById, findModuleById, findLessonById } from '@/data/courses';

/**
 * Validates if a lesson file exists
 * @param courseId - The course ID
 * @param moduleId - The module ID
 * @param lessonId - The lesson ID
 * @returns Promise that resolves to true if the file exists, false otherwise
 */
export const validateLessonContent = async (
  courseId: string, 
  moduleId: string, 
  lessonId: string
): Promise<boolean> => {
  try {
    // Use the descriptive ID format for the content path
    const contentPath = `/courses/${courseId}/${moduleId}/${lessonId}.html`;
    console.log(`Validando existencia de archivo: ${contentPath}`);
    const response = await fetch(contentPath, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Error validating lesson content: ${error}`);
    return false;
  }
};

/**
 * Interface for course content validation results
 */
interface ContentValidationResult {
  valid: boolean;
  courseId: string;
  modulesChecked: number;
  lessonsChecked: number;
  missingLessons: { moduleId: string; lessonId: string }[];
  error?: string;
}

/**
 * Checks the existence of a course's lesson content files
 * @param courseId - The course ID
 * @returns Promise that resolves to an object with validation results
 */
export const validateCourseContent = async (courseId: string): Promise<ContentValidationResult | { valid: boolean; error: string }> => {
  const course = findCourseById(courseId);
  if (!course) {
    return { valid: false, error: `Curso no encontrado: ${courseId}` };
  }
  
  const results: ContentValidationResult = {
    valid: true,
    courseId,
    modulesChecked: 0,
    lessonsChecked: 0,
    missingLessons: []
  };
  
  for (const module of course.modules) {
    results.modulesChecked++;
    
    for (const lesson of module.lessons) {
      results.lessonsChecked++;
      
      const exists = await validateLessonContent(courseId, module.id, lesson.id);
      if (!exists) {
        results.missingLessons.push({
          moduleId: module.id,
          lessonId: lesson.id
        });
      }
    }
  }
  
  results.valid = results.missingLessons.length === 0;
  return results;
};

/**
 * Validates the file structure for the static content
 * Useful for debugging when lesson content isn't loading properly
 */
export const debugCourseStructure = async (courseId: string) => {
  const result = await validateCourseContent(courseId);
  console.log('Course content validation results:', result);
  
  if (!result.valid && 'missingLessons' in result) {
    console.warn('Missing lesson files detected:', result.missingLessons);
    
    // More detailed information about missing files
    for (const missing of result.missingLessons) {
      const module = findModuleById(courseId, missing.moduleId);
      const lesson = module ? findLessonById(courseId, missing.moduleId, missing.lessonId) : null;
      
      console.warn(`Missing file for: ${module?.title || missing.moduleId} → ${lesson?.title || missing.lessonId}`);
      console.warn(`Expected path: /courses/${courseId}/${missing.moduleId}/${missing.lessonId}.html`);
    }
  }
  
  return result;
};
