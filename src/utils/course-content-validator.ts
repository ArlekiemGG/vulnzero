
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
    const contentPath = `/courses/${courseId}/${moduleId}/${lessonId}.html`;
    const response = await fetch(contentPath, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Error validating lesson content: ${error}`);
    return false;
  }
};

/**
 * Checks the existence of a course's lesson content files
 * @param courseId - The course ID
 * @returns Promise that resolves to an object with validation results
 */
export const validateCourseContent = async (courseId: string) => {
  const course = findCourseById(courseId);
  if (!course) {
    return { valid: false, error: `Curso no encontrado: ${courseId}` };
  }
  
  const results: {
    courseId: string;
    modulesChecked: number;
    lessonsChecked: number;
    missingLessons: { moduleId: string; lessonId: string }[];
  } = {
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
  
  return {
    valid: results.missingLessons.length === 0,
    ...results
  };
};

/**
 * Validates the file structure for the static content
 * Useful for debugging when lesson content isn't loading properly
 */
export const debugCourseStructure = async (courseId: string) => {
  const result = await validateCourseContent(courseId);
  console.log('Course content validation results:', result);
  
  if (!result.valid) {
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
