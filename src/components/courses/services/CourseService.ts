import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  level: string;
  instructor: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  title: string;
  course_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration_minutes: number;
  section_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  video_url: string | null;
  module_id?: string;
  quizData?: any;  // Añadida propiedad opcional quizData
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  started_at: string;
  completed: boolean;
  completed_at: string | null;
  last_lesson_id: string | null;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export const CourseService = {
  async getCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos",
        variant: "destructive",
      });
      return [];
    }
  },

  async getCoursesByLevel(level: string): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('level', level)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching ${level} courses:`, error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los cursos de nivel ${level}`,
        variant: "destructive",
      });
      return [];
    }
  },

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching course by id:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el curso",
        variant: "destructive",
      });
      return null;
    }
  },

  async getCourseSections(courseId: string): Promise<Section[]> {
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching course sections:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las secciones del curso",
        variant: "destructive",
      });
      return [];
    }
  },

  async getSectionLessons(sectionId: string): Promise<Lesson[]> {
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('section_id', sectionId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching section lessons:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las lecciones de la sección",
        variant: "destructive",
      });
      return [];
    }
  },

  async getLessonById(id: string): Promise<Lesson | null> {
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching lesson by id:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lección",
        variant: "destructive",
      });
      return null;
    }
  }
};
