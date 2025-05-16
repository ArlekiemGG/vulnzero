
import { supabase } from '@/integrations/supabase/client';
import { Course, Section, Lesson } from './CourseService';
import { StaticContentService } from './StaticContentService';
import { StaticCourseContent, StaticSection, StaticLesson, SectionWithLessons } from '../types';

// Este servicio combina datos estáticos con datos dinámicos de Supabase
export const HybridCourseService = {
  /**
   * Obtiene información de curso combinando datos estáticos con dinámicos
   */
  getCourseById: async (courseId: string): Promise<Course | null> => {
    // Obtenemos el contenido estático
    const staticCourse = StaticContentService.getCourseContent(courseId);
    if (!staticCourse) return null;
    
    try {
      // Obtenemos metadata dinámica desde Supabase (si existe)
      const { data: dynamicCourse } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();
      
      // Si existe metadata en Supabase, la combinamos con el contenido estático
      if (dynamicCourse) {
        return {
          ...dynamicCourse,
          title: staticCourse.title || dynamicCourse.title
        };
      }
      
      // Si no hay metadata en Supabase, creamos un objeto de curso a partir del estático
      return {
        id: staticCourse.id,
        title: staticCourse.title,
        description: "Curso con contenido estático",
        image_url: "/placeholder.svg",
        category: "General",
        level: "intermedio",
        instructor: "Instructor",
        duration_minutes: staticCourse.sections.reduce((total, section) => 
          total + section.lessons.reduce((acc, lesson) => acc + lesson.duration_minutes, 0), 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dynamic course data:', error);
      return null;
    }
  },
  
  /**
   * Obtiene las secciones de un curso desde el contenido estático
   */
  getCourseSections: async (courseId: string): Promise<Section[]> => {
    const staticSections = StaticContentService.getCourseSections(courseId);
    return staticSections.map(section => ({
      id: section.id,
      title: section.title,
      course_id: courseId,
      position: 0, // Posición predeterminada
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  },
  
  /**
   * Obtiene las lecciones de una sección desde el contenido estático
   */
  getSectionLessons: async (sectionId: string): Promise<Lesson[]> => {
    // En un escenario real, deberíamos poder encontrar el courseId a partir del sectionId
    // Esto es una simplificación
    for (const courseId of Object.keys(StaticContentService.getAllCourses())) {
      const sections = StaticContentService.getCourseSections(courseId);
      const section = sections.find(s => s.id === sectionId);
      
      if (section) {
        const staticLessons = StaticContentService.getSectionLessons(courseId, sectionId);
        return staticLessons.map((lesson, index) => ({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          duration_minutes: lesson.duration_minutes,
          section_id: sectionId,
          position: index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          video_url: null
        }));
      }
    }
    
    return [];
  },
  
  /**
   * Obtiene una lección por su ID
   */
  getLessonById: async (lessonId: string): Promise<Lesson | null> => {
    // Buscamos la lección en todos los cursos (esto sería más eficiente con un índice)
    for (const courseData of Object.entries(StaticContentService.getAllCourses())) {
      const courseId = courseData[0];
      const sections = StaticContentService.getCourseSections(courseId);
      
      for (const section of sections) {
        const lessons = StaticContentService.getSectionLessons(courseId, section.id);
        const lessonStatic = lessons.find(l => l.id === lessonId);
        
        if (lessonStatic) {
          return {
            id: lessonStatic.id,
            title: lessonStatic.title,
            content: lessonStatic.content,
            duration_minutes: lessonStatic.duration_minutes,
            section_id: section.id,
            position: lessons.findIndex(l => l.id === lessonId),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            video_url: null
          };
        }
      }
    }
    
    return null;
  },
  
  /**
   * Carga todos los cursos combinando datos estáticos con dinámicos
   */
  getAllCourses: async (): Promise<Course[]> => {
    const staticCourses = StaticContentService.getAllCourses();
    const staticIds = staticCourses.map(c => c.id);
    
    try {
      // Cargamos metadata dinámica de Supabase
      const { data: dynamicCourses } = await supabase
        .from('courses')
        .select('*')
        .in('id', staticIds);
      
      // Creamos un mapa para facilitar el acceso
      const dynamicMap: Record<string, Course> = {};
      dynamicCourses?.forEach(course => {
        dynamicMap[course.id] = course;
      });
      
      // Combinamos datos estáticos con dinámicos
      return staticCourses.map(staticCourse => {
        const dynamicCourse = dynamicMap[staticCourse.id];
        
        if (dynamicCourse) {
          return {
            ...dynamicCourse,
            title: staticCourse.title || dynamicCourse.title
          };
        }
        
        // Si no hay datos dinámicos, creamos un objeto de curso a partir del estático
        return {
          id: staticCourse.id,
          title: staticCourse.title,
          description: "Curso con contenido estático",
          image_url: "/placeholder.svg",
          category: "General",
          level: "intermedio",
          instructor: "Instructor",
          duration_minutes: 0, // Se calcularía sumando todas las lecciones
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Error fetching dynamic course data:', error);
      
      // En caso de error, devolvemos al menos los datos estáticos
      return staticCourses.map(staticCourse => ({
        id: staticCourse.id,
        title: staticCourse.title,
        description: "Curso con contenido estático",
        image_url: "/placeholder.svg",
        category: "General",
        level: "intermedio",
        instructor: "Instructor",
        duration_minutes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    }
  }
};
