
import { findCourseById } from '@/data/courses';
import { validateLessonContent } from '@/utils/course-content-validator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Interface for representing course structure information
 */
export interface CourseStructureInfo {
  id: string;
  title: string;
  modulesCount: number;
  lessonsCount: number;
  validLessons: number;
  missingLessons: { moduleId: string; lessonId: string }[];
}

/**
 * Verifies the structure of a course, checking that all necessary lesson files exist
 * @param courseId - The ID of the course to validate
 * @returns Promise that resolves to an object with validation results
 */
export async function validateCourseStructure(courseId: string): Promise<CourseStructureInfo | null> {
  const course = findCourseById(courseId);
  if (!course) return null;
  
  const result: CourseStructureInfo = {
    id: courseId,
    title: course.title,
    modulesCount: course.modules.length,
    lessonsCount: 0,
    validLessons: 0,
    missingLessons: []
  };
  
  for (const module of course.modules) {
    result.lessonsCount += module.lessons.length;
    
    for (const lesson of module.lessons) {
      const exists = await validateLessonContent(courseId, module.id, lesson.id);
      
      if (exists) {
        result.validLessons++;
      } else {
        result.missingLessons.push({
          moduleId: module.id,
          lessonId: lesson.id
        });
      }
    }
  }
  
  return result;
}

/**
 * Synchronizes course structure with Supabase
 * Makes sure the database has all courses, modules and lessons registered
 */
export async function syncCourseWithDatabase(courseId: string): Promise<boolean> {
  try {
    const course = findCourseById(courseId);
    if (!course) {
      console.error(`Course not found: ${courseId}`);
      return false;
    }
    
    // Check if course exists in database
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .maybeSingle();
    
    // If course doesn't exist, create it
    if (!existingCourse) {
      const { error: courseError } = await supabase
        .from('courses')
        .insert({
          id: course.id,
          title: course.title,
          description: course.description,
          image_url: course.image_url,
          category: course.category,
          level: course.level,
          instructor: course.instructor,
          duration_minutes: course.duration_minutes
        });
      
      if (courseError) {
        console.error(`Error creating course: ${courseError.message}`);
        return false;
      }
    }
    
    // Process modules and lessons
    for (const module of course.modules) {
      // Check if module exists
      const { data: existingModule } = await supabase
        .from('course_sections')
        .select('id')
        .eq('id', module.id)
        .eq('course_id', courseId)
        .maybeSingle();
      
      // If module doesn't exist, create it
      if (!existingModule) {
        const { error: moduleError } = await supabase
          .from('course_sections')
          .insert({
            id: module.id,
            course_id: courseId,
            title: module.title,
            position: module.position
          });
        
        if (moduleError) {
          console.error(`Error creating module: ${moduleError.message}`);
          continue;
        }
      }
      
      // Process lessons
      for (const lesson of module.lessons) {
        // Verify lesson content exists
        const contentExists = await validateLessonContent(courseId, module.id, lesson.id);
        
        if (!contentExists) {
          console.warn(`Lesson content file not found for: ${module.id}/${lesson.id}`);
          // We'll still create the lesson record, just mark it as having missing content
        }
        
        // Check if lesson exists
        const { data: existingLesson } = await supabase
          .from('course_lessons')
          .select('id')
          .eq('id', lesson.id)
          .eq('section_id', module.id)
          .maybeSingle();
        
        // If lesson doesn't exist, create it
        if (!existingLesson) {
          const { error: lessonError } = await supabase
            .from('course_lessons')
            .insert({
              id: lesson.id,
              section_id: module.id,
              title: lesson.title,
              content: contentExists ? 'Content available in static file' : 'Content missing',
              duration_minutes: lesson.duration_minutes,
              position: module.lessons.indexOf(lesson),
              video_url: null
            });
          
          if (lessonError) {
            console.error(`Error creating lesson: ${lessonError.message}`);
            continue;
          }
        }
      }
    }
    
    toast({
      title: 'Sincronización completada',
      description: `El curso "${course.title}" ha sido sincronizado con la base de datos`
    });
    
    return true;
  } catch (error) {
    console.error('Error synchronizing course with database:', error);
    toast({
      title: 'Error de sincronización',
      description: 'No se pudo sincronizar el curso con la base de datos',
      variant: 'destructive'
    });
    return false;
  }
}

/**
 * Returns information about all courses and their structure
 */
export async function getAllCoursesStructureInfo(): Promise<CourseStructureInfo[]> {
  const allCourses = await import('@/data/courses').then(mod => mod.default);
  const results: CourseStructureInfo[] = [];
  
  for (const course of allCourses) {
    const info = await validateCourseStructure(course.id);
    if (info) {
      results.push(info);
    }
  }
  
  return results;
}
