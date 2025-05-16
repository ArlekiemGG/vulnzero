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
 * Recupera el progreso del curso para un usuario y curso específico
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
 * Recupera el progreso de las lecciones para un usuario y curso específico
 */
export async function getLessonProgress(userId: string, courseId: string): Promise<LessonProgressResponse> {
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('course_id', courseId);
  
  // Transformamos la respuesta para simplificar el manejo de tipos
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
 * Verifica si existe un registro de progreso para una lección
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
 * Actualiza un registro existente de progreso de lección
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
 * Crea un nuevo registro de progreso de lección
 */
export async function createLessonProgress(data: LessonProgressItem): Promise<SupabaseSimpleResponse> {
  return await supabase
    .from('user_lesson_progress')
    .insert([data]);
}

/**
 * Cuenta el total de lecciones en un curso
 */
export async function countTotalLessons(courseId: string): Promise<TotalLessonsResponse> {
  const { count, error } = await supabase
    .from('course_sections')
    .select('course_lessons(*)', { count: 'exact' })
    .eq('course_id', courseId);
  
  return { count: count !== null ? count : 0, error };
}

/**
 * Cuenta las lecciones completadas por un usuario en un curso
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
 * Verifica si existe un registro de progreso para un curso
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
 * Actualiza un registro existente de progreso de curso
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
 * Crea un nuevo registro de progreso de curso
 */
export async function createCourseProgressRecord(data: CourseProgressItem): Promise<SupabaseSimpleResponse> {
  return await supabase
    .from('user_course_progress')
    .insert([data]);
}

/**
 * Actualiza el campo course_id en los registros de progreso de lecciones
 * que no tienen asociado un course_id
 */
export async function updateLessonProgressCourseId(): Promise<SupabaseSimpleResponse> {
  return await supabase.rpc('update_lesson_progress_course_id');
}
