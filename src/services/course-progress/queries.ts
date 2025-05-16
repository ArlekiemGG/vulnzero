
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
 * Obtiene los datos de progreso de un curso para un usuario
 */
export async function getCourseProgress(userId: string, courseId: string): Promise<SupabaseSimpleResponse> {
  const response = await supabase
    .from('user_course_progress')
    .select('progress_percentage, completed')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
  
  return response;
}

/**
 * Obtiene el progreso de las lecciones de un curso para un usuario
 * Usando un enfoque simplificado para evitar problemas de inferencia de tipos
 */
export async function getLessonProgress(userId: string, courseId: string): Promise<LessonProgressResponse> {
  // Usamos tipado explícito para la respuesta
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('course_id', courseId); // Ahora filtramos por course_id
  
  // Filtramos manualmente los resultados para evitar la inferencia profunda
  let filteredData: SimpleLessonProgress[] = [];
  
  if (data) {
    filteredData = data
      .map((item: any) => ({
        lesson_id: item.lesson_id,
        completed: !!item.completed,
        course_id: courseId
      }));
  }
  
  // Retornamos una estructura simplificada que evita problemas de inferencia de tipos
  return {
    data: filteredData,
    error: error
  };
}

/**
 * Verifica si existe un progreso de lección
 */
export async function checkLessonProgressExists(userId: string, courseId: string, lessonId: string): Promise<SupabaseSimpleResponse> {
  // Utilizamos un enfoque de tipado explícito para evitar inferencia profunda
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId) // Ahora filtramos también por course_id
    .eq('lesson_id', lessonId)
    .maybeSingle();
  
  // Retornamos una estructura simplificada
  return { data, error };
}

/**
 * Actualiza un progreso de lección existente
 */
export async function updateLessonProgress(id: string, data: Partial<LessonProgressItem>): Promise<SupabaseSimpleResponse> {
  const response = await supabase
    .from('user_lesson_progress')
    .update(data)
    .eq('id', id);
  
  return response;
}

/**
 * Crea un nuevo registro de progreso de lección
 */
export async function createLessonProgress(data: LessonProgressItem): Promise<SupabaseSimpleResponse> {
  const response = await supabase
    .from('user_lesson_progress')
    .insert([data]);
  
  return response;
}

/**
 * Cuenta el total de lecciones en un curso
 * Usando un enfoque simplificado para evitar problemas de inferencia de tipos
 */
export async function countTotalLessons(courseId: string): Promise<TotalLessonsResponse> {
  // Consulta simplificada para evitar problemas de inferencia profunda
  const { count, error } = await supabase
    .from('course_sections')
    .select('course_lessons(*)', { count: 'exact' })
    .eq('course_id', courseId);
  
  // Retornamos una estructura simplificada que evita problemas de inferencia de tipos
  return {
    count: count !== null ? count : 0,
    error: error
  };
}

/**
 * Cuenta las lecciones completadas por un usuario en un curso
 */
export async function countCompletedLessons(userId: string, courseId: string): Promise<SupabaseSimpleResponse> {
  const response = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('completed', true);
  
  return response;
}

/**
 * Verifica si existe un progreso de curso
 */
export async function checkCourseProgressExists(userId: string, courseId: string): Promise<SupabaseSimpleResponse> {
  const { data, error } = await supabase
    .from('user_course_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
  
  // Retornamos una estructura simplificada
  return { data, error };
}

/**
 * Actualiza un progreso de curso existente
 */
export async function updateCourseProgressRecord(id: string, data: Partial<CourseProgressItem>): Promise<SupabaseSimpleResponse> {
  const response = await supabase
    .from('user_course_progress')
    .update(data)
    .eq('id', id);
  
  return response;
}

/**
 * Crea un nuevo registro de progreso de curso
 */
export async function createCourseProgressRecord(data: CourseProgressItem): Promise<SupabaseSimpleResponse> {
  const response = await supabase
    .from('user_course_progress')
    .insert([data]);
  
  return response;
}
