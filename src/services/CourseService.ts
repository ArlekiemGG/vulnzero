
import { supabase } from '@/integrations/supabase/client';

// Define interfaces for our course system
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  image_url: string;
  instructor: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: string;
  section_id: string;
  title: string;
  content: string;
  video_url: string | null;
  duration_minutes: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  last_lesson_id: string | null;
  progress_percentage: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export const CourseService = {
  // Obtener todos los cursos
  async getCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data as unknown) as Course[] || [];
  },

  // Obtener un curso por ID
  async getCourseById(courseId: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error) throw error;
    return (data as unknown) as Course;
  },

  // Obtener secciones de un curso
  async getCourseSections(courseId: string): Promise<CourseSection[]> {
    const { data, error } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    return (data as unknown) as CourseSection[] || [];
  },

  // Obtener lecciones de una sección
  async getSectionLessons(sectionId: string): Promise<CourseLesson[]> {
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('section_id', sectionId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    return (data as unknown) as CourseLesson[] || [];
  },

  // Obtener una lección por ID
  async getLessonById(lessonId: string): Promise<CourseLesson | null> {
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('id', lessonId)
      .single();
    
    if (error) throw error;
    return (data as unknown) as CourseLesson;
  },
  
  // Obtener progreso del curso para un usuario
  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (error) throw error;
    return (data as unknown) as CourseProgress | null;
  },

  // Iniciar o actualizar progreso del curso
  async updateCourseProgress(
    userId: string, 
    courseId: string, 
    lessonId: string | null = null, 
    percentage: number = 0
  ): Promise<void> {
    // Verificar si ya existe un registro de progreso
    const { data: existingProgress } = await supabase
      .from('user_course_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existingProgress) {
      // Actualizar progreso existente
      const { error } = await supabase
        .from('user_course_progress')
        .update({
          last_lesson_id: lessonId || existingProgress.last_lesson_id,
          progress_percentage: percentage,
          completed: percentage === 100,
          completed_at: percentage === 100 ? new Date().toISOString() : null
        })
        .eq('id', existingProgress.id);
      
      if (error) throw error;
    } else {
      // Crear nuevo registro de progreso
      const { error } = await supabase
        .from('user_course_progress')
        .insert({
          user_id: userId,
          course_id: courseId,
          last_lesson_id: lessonId,
          progress_percentage: percentage,
          completed: percentage === 100,
          completed_at: percentage === 100 ? new Date().toISOString() : null
        });
      
      if (error) throw error;
    }
  },

  // Marcar una lección como completada
  async markLessonCompleted(userId: string, lessonId: string): Promise<void> {
    // Verificar si ya existe un registro de progreso para esta lección
    const { data: existingProgress } = await supabase
      .from('user_lesson_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (existingProgress) {
      // Actualizar progreso existente
      const { error } = await supabase
        .from('user_lesson_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id);
      
      if (error) throw error;
    } else {
      // Crear nuevo registro de progreso
      const { error } = await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }

    // Actualizar el progreso general del curso
    await this.recalculateCourseProgress(userId, lessonId);
  },

  // Obtener el estado de una lección para un usuario
  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    
    if (error) throw error;
    return (data as unknown) as LessonProgress | null;
  },

  // Recalcular el progreso general del curso
  async recalculateCourseProgress(userId: string, lessonId: string): Promise<void> {
    // Primero, obtener la lección para encontrar la sección y el curso
    const { data: lessonData, error: lessonError } = await supabase
      .from('course_lessons')
      .select('section_id')
      .eq('id', lessonId)
      .single();
    
    if (lessonError) throw lessonError;

    // Obtener la sección para encontrar el curso
    const { data: sectionData, error: sectionError } = await supabase
      .from('course_sections')
      .select('course_id')
      .eq('id', lessonData.section_id)
      .single();
    
    if (sectionError) throw sectionError;

    const courseId = sectionData.course_id;

    // Obtener total de lecciones en el curso mediante una subconsulta
    const courseSectionsQuery = supabase
      .from('course_sections')
      .select('id')
      .eq('course_id', courseId);

    const { count: totalLessons, error: countError } = await supabase
      .from('course_lessons')
      .select('*', { count: 'exact', head: true })
      .in('section_id', courseSectionsQuery);
    
    if (countError) throw countError;

    // Obtener lecciones completadas por el usuario mediante una subconsulta
    const courseLessonsQuery = supabase
      .from('course_lessons')
      .select('id')
      .in('section_id', courseSectionsQuery);

    const { count: completedLessons, error: completedError } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true)
      .in('lesson_id', courseLessonsQuery);
    
    if (completedError) throw completedError;

    // Calcular porcentaje de progreso
    const percentage = totalLessons && totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Actualizar el progreso del curso
    await this.updateCourseProgress(userId, courseId, lessonId, percentage);
  },

  // Obtener cursos completados por el usuario
  async getCompletedCourses(userId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select(`
        course_id,
        courses:course_id (*)
      `)
      .eq('user_id', userId)
      .eq('completed', true);
    
    if (error) throw error;
    return data && data.length > 0 
      ? data.map(item => ((item.courses || {}) as unknown) as Course) 
      : [];
  },

  // Obtener cursos en progreso por el usuario
  async getInProgressCourses(userId: string): Promise<(Course & { progress: number })[]> {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select(`
        progress_percentage,
        course_id,
        courses:course_id (*)
      `)
      .eq('user_id', userId)
      .eq('completed', false)
      .order('progress_percentage', { ascending: false });
    
    if (error) throw error;
    
    return data && data.length > 0
      ? data.map(item => ({
          ...((item.courses || {}) as unknown as Course),
          progress: item.progress_percentage
        }))
      : [];
  }
};
