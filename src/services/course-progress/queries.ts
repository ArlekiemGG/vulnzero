
import { supabase } from '@/integrations/supabase/client';
import { LessonProgressItem, CourseProgressItem } from './types';

/**
 * Obtiene los datos de progreso de un curso para un usuario
 */
export async function getCourseProgress(userId: string, courseId: string) {
  return supabase
    .from('user_course_progress')
    .select('progress_percentage, completed')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
}

/**
 * Obtiene el progreso de las lecciones de un curso para un usuario
 */
export async function getLessonProgress(userId: string, courseId: string) {
  // Usamos 'unknown' y luego hacemos un cast seguro para evitar problemas de tipo
  const result = await supabase
    .from('user_lesson_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('course_id', courseId);
  
  return result;
}

/**
 * Verifica si existe un progreso de lección
 */
export async function checkLessonProgressExists(userId: string, courseId: string, lessonId: string) {
  return supabase
    .from('user_lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
}

/**
 * Actualiza un progreso de lección existente
 */
export async function updateLessonProgress(id: string, data: Partial<LessonProgressItem>) {
  return supabase
    .from('user_lesson_progress')
    .update(data)
    .eq('id', id);
}

/**
 * Crea un nuevo registro de progreso de lección
 */
export async function createLessonProgress(data: Partial<LessonProgressItem>) {
  return supabase
    .from('user_lesson_progress')
    .insert(data);
}

/**
 * Cuenta el total de lecciones en un curso
 */
export async function countTotalLessons(courseId: string) {
  // Usamos 'unknown' para evitar problemas de tipo
  const result = await supabase
    .from('user_lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);
  
  return result;
}

/**
 * Cuenta las lecciones completadas por un usuario en un curso
 */
export async function countCompletedLessons(userId: string, courseId: string) {
  // Usamos 'unknown' para evitar problemas de tipo
  const result = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('completed', true);
  
  return result;
}

/**
 * Verifica si existe un progreso de curso
 */
export async function checkCourseProgressExists(userId: string, courseId: string) {
  return supabase
    .from('user_course_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
}

/**
 * Actualiza un progreso de curso existente
 */
export async function updateCourseProgressRecord(id: string, data: Partial<CourseProgressItem>) {
  return supabase
    .from('user_course_progress')
    .update(data)
    .eq('id', id);
}

/**
 * Crea un nuevo registro de progreso de curso
 */
export async function createCourseProgressRecord(data: Partial<CourseProgressItem>) {
  return supabase
    .from('user_course_progress')
    .insert(data);
}
