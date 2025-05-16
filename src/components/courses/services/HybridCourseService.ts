
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
    if (!courseId) {
      console.error('Error: courseId es undefined o null');
      return null;
    }
    
    // Aseguramos que courseId es un string y eliminamos espacios
    const courseIdStr = String(courseId).trim();
    console.log(`HybridCourseService: Buscando curso con ID: "${courseIdStr}"`);
    
    // Obtenemos el contenido estático (con verificación de normalización)
    const normalizedId = courseIdStr.replace(/-/g, '').toLowerCase();
    console.log(`HybridCourseService: ID normalizado para búsqueda: "${normalizedId}"`);
    
    // Intentamos buscar el curso tanto con el ID original como con el normalizado
    const staticCourse = StaticContentService.getCourseContent(courseIdStr) || 
                         StaticContentService.findCourseByNormalizedId(normalizedId);
    
    if (!staticCourse) {
      console.error(`HybridCourseService: No se encontró el curso estático con ID: "${courseIdStr}" ni con ID normalizado: "${normalizedId}"`);
      return null;
    }
    
    console.log(`HybridCourseService: Curso estático encontrado:`, staticCourse);
    
    try {
      // Obtenemos metadata dinámica desde Supabase (si existe)
      const { data: dynamicCourse } = await supabase
        .from('courses')
        .select('*')
        .eq('id', staticCourse.id) // Usamos el ID del curso estático encontrado
        .maybeSingle();
      
      console.log('HybridCourseService: Datos dinámicos recibidos:', dynamicCourse);
      
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
      console.error('HybridCourseService: Error fetching dynamic course data:', error);
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
   * Obtiene una sección específica por su ID
   */
  getSectionById: async (sectionId: string): Promise<Section | null> => {
    // Intentamos primero buscar en datos dinámicos
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .select('*')
        .eq('id', sectionId)
        .maybeSingle();
        
      if (data) {
        return data as Section;
      }
    } catch (error) {
      console.error('Error fetching section from database:', error);
    }
    
    // Si no se encuentra en la base de datos, buscamos en datos estáticos
    for (const courseId of Object.keys(StaticContentService.getAllCourses())) {
      const sections = StaticContentService.getCourseSections(courseId);
      const section = sections.find(s => s.id === sectionId);
      
      if (section) {
        return {
          id: section.id,
          title: section.title,
          course_id: courseId,
          position: 0, // Posición predeterminada
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }
    
    return null;
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
  },
  
  // Método para obtener el progreso de lección por usuario
  getLessonProgressByUserId: async (lessonId: string, userId: string): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching lesson progress:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getLessonProgressByUserId:', error);
      return null;
    }
  },
};
