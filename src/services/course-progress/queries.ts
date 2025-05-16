
import { supabase } from '@/integrations/supabase/client';
import { 
  LessonProgressItem, 
  CourseProgressItem, 
  LessonProgressResponse, 
  TotalLessonsResponse, 
  SupabaseSimpleResponse,
  SimpleLessonProgress
} from './types';

/**
 * Retrieves course progress for a specific user and course
 */
export async function getCourseProgress(userId: string, courseId: string): Promise<SupabaseSimpleResponse> {
  return await supabase
    .from('user_course_progress')
    .select('progress_percentage, completed')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
}

/**
 * Retrieves lesson progress for a specific user and course
 */
export async function getLessonProgress(userId: string, courseId: string): Promise<LessonProgressResponse> {
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('course_id', courseId);
  
  // Transform response to simplify type handling
  let filteredData: SimpleLessonProgress[] = [];
  
  if (data) {
    filteredData = data.map((item: any) => ({
      lesson_id: item.lesson_id,
      completed: !!item.completed,
      course_id: courseId
    }));
  }
  
  return { data: filteredData, error };
}

/**
 * Checks if a lesson progress record exists
 */
export async function checkLessonProgressExists(
  userId: string, 
  courseId: string, 
  lessonId: string
): Promise<SupabaseSimpleResponse> {
  return await supabase
    .from('user_lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
}

/**
 * Updates an existing lesson progress record
 */
export async function updateLessonProgress(
  id: string, 
  data: Partial<LessonProgressItem>
): Promise<SupabaseSimpleResponse> {
  return await supabase
    .from('user_lesson_progress')
    .update(data)
    .eq('id', id);
}

/**
 * Creates a new lesson progress record
 */
export async function createLessonProgress(data: LessonProgressItem): Promise<SupabaseSimpleResponse> {
  return await supabase
    .from('user_lesson_progress')
    .insert([data]);
}

/**
 * Counts total lessons in a course
 */
export async function countTotalLessons(courseId: string): Promise<TotalLessonsResponse> {
  const { count, error } = await supabase
    .from('course_sections')
    .select('course_lessons(*)', { count: 'exact' })
    .eq('course_id', courseId);
  
  return { count: count !== null ? count : 0, error };
}

/**
 * Counts completed lessons for a user in a course
 */
export async function countCompletedLessons(userId: string, courseId: string): Promise<SupabaseSimpleResponse> {
  return await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('completed', true);
}

/**
 * Checks if a course progress record exists
 */
export async function checkCourseProgressExists(userId: string, courseId: string): Promise<SupabaseSimpleResponse> {
  return await supabase
    .from('user_course_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
}

/**
 * Updates an existing course progress record
 */
export async function updateCourseProgressRecord(
  id: string, 
  data: Partial<CourseProgressItem>
): Promise<SupabaseSimpleResponse> {
  return await supabase
    .from('user_course_progress')
    .update(data)
    .eq('id', id);
}

/**
 * Creates a new course progress record
 */
export async function createCourseProgressRecord(data: CourseProgressItem): Promise<SupabaseSimpleResponse> {
  return await supabase
    .from('user_course_progress')
    .insert([data]);
}
