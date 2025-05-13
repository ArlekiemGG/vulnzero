
import { supabase } from '@/integrations/supabase/client';
import { courseData } from '@/data/courseData';

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
  // Verificar si hay cursos y sembrarlos si es necesario
  async ensureCoursesExist(): Promise<boolean> {
    try {
      // Verificar si ya existen cursos
      const { count, error: countError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Si ya existen cursos, no hacemos nada
      if (count && count > 0) {
        console.log(`Found ${count} existing courses`);
        return false;
      }
      
      console.log('No courses found, seeding initial courses...');
      
      // Insertar cursos desde courseData
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .insert(courseData)
        .select();
      
      if (coursesError) throw coursesError;
      
      console.log(`Successfully inserted ${coursesData?.length} courses`);
      
      // Crear secciones para cada curso
      for (const course of (coursesData || [])) {
        // Crear 3-5 secciones por curso
        const sectionCount = Math.floor(Math.random() * 3) + 3; // 3-5 secciones
        
        const sections = [];
        for (let i = 1; i <= sectionCount; i++) {
          sections.push({
            course_id: course.id,
            title: `Módulo ${i}: ${this.getSectionTitle(course.title, i)}`,
            position: i
          });
        }
        
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('course_sections')
          .insert(sections)
          .select();
        
        if (sectionsError) throw sectionsError;
        
        console.log(`Created ${sectionsData.length} sections for course ${course.title}`);
        
        // Crear lecciones para cada sección
        for (const section of sectionsData) {
          // Crear 3-7 lecciones por sección
          const lessonCount = Math.floor(Math.random() * 5) + 3; // 3-7 lecciones
          
          const lessons = [];
          for (let i = 1; i <= lessonCount; i++) {
            lessons.push({
              section_id: section.id,
              title: `Lección ${i}: ${this.getLessonTitle(section.title, i)}`,
              content: this.getLessonContent(section.title, i),
              duration_minutes: Math.floor(Math.random() * 25) + 15, // 15-40 minutos
              position: i,
              video_url: Math.random() > 0.5 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null // 50% chance to have a video
            });
          }
          
          const { error: lessonsError } = await supabase
            .from('course_lessons')
            .insert(lessons);
          
          if (lessonsError) throw lessonsError;
        }
      }
      
      console.log('Course seeding completed successfully!');
      return true;
    } catch (error) {
      console.error('Error ensuring courses exist:', error);
      return false;
    }
  },

  // Helper methods for generating course content
  getSectionTitle(courseTitle: string, sectionNumber: number): string {
    const basicSectionTitles = [
      'Introducción y Conceptos Fundamentales',
      'Instalación y Configuración de Herramientas',
      'Metodología y Mejores Prácticas',
      'Casos Prácticos',
      'Técnicas Avanzadas',
      'Mitigación y Protección',
      'Evaluación y Continuidad'
    ];
    
    return basicSectionTitles[sectionNumber - 1] || `Contenido Avanzado ${sectionNumber}`;
  },

  getLessonTitle(sectionTitle: string, lessonNumber: number): string {
    if (sectionTitle.includes('Introducción')) {
      const introLessons = [
        'Panorama actual de la ciberseguridad',
        'Tipos de amenazas y vectores de ataque',
        'Terminología esencial',
        'Principios de seguridad',
        'Configuración del entorno de trabajo',
        'Recursos y comunidades'
      ];
      return introLessons[lessonNumber - 1] || `Tema introductorio ${lessonNumber}`;
    }
    
    if (sectionTitle.includes('Herramientas')) {
      const toolLessons = [
        'Herramientas de reconocimiento',
        'Analizadores de vulnerabilidades',
        'Herramientas de explotación',
        'Frameworks de seguridad',
        'Soluciones de monitorización',
        'Configuración avanzada'
      ];
      return toolLessons[lessonNumber - 1] || `Herramienta especializada ${lessonNumber}`;
    }
    
    return `Contenido especializado ${lessonNumber}`;
  },

  getLessonContent(sectionTitle: string, lessonNumber: number): string {
    // Generate markdown content for the lesson
    return `
# ${sectionTitle} - Lección ${lessonNumber}

## Objetivos de aprendizaje
- Comprender los conceptos fundamentales de esta lección
- Aplicar conocimientos en situaciones prácticas
- Desarrollar habilidades técnicas específicas

## Contenido principal

Este módulo aborda aspectos esenciales sobre ciberseguridad y técnicas defensivas y ofensivas. 
Los contenidos han sido estructurados de manera progresiva para facilitar el aprendizaje.

### Conceptos clave

1. **Seguridad por capas**: Implementación de múltiples mecanismos de defensa.
2. **Principio de menor privilegio**: Limitar accesos solo a lo necesario.
3. **Actualización continua**: Mantener sistemas y conocimientos al día.

### Demostración práctica

\`\`\`python
def security_check(system):
    vulnerabilities = scan_system(system)
    for vuln in vulnerabilities:
        print(f"Vulnerabilidad encontrada: {vuln.name}")
        print(f"Nivel de riesgo: {vuln.risk_level}")
        print(f"Recomendación: {vuln.mitigation}")
    return len(vulnerabilities)
\`\`\`

## Ejercicios prácticos

1. Analizar un sistema utilizando las herramientas presentadas
2. Identificar posibles vulnerabilidades
3. Proponer soluciones para mitigar los riesgos encontrados

## Recursos adicionales

- [OWASP Top 10](https://owasp.org/Top10/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [MITRE ATT&CK](https://attack.mitre.org/)

## Evaluación

Para completar esta lección, deberás responder correctamente al cuestionario y realizar el ejercicio práctico propuesto.

---

> "La seguridad no es un producto, sino un proceso." - Bruce Schneier
  `;
  },

  // Obtener todos los cursos
  async getCourses(): Promise<Course[]> {
    // Primero verificamos si hay cursos, y si no, los sembramos
    await this.ensureCoursesExist();
    
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
      .select('*') // Changed from just 'id' to '*' to get all fields including last_lesson_id
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

    // Obtener todas las secciones del curso
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('course_sections')
      .select('id')
      .eq('course_id', courseId);
      
    if (sectionsError) throw sectionsError;

    // Extract section IDs into an array
    const sectionIds = sectionsData.map(section => section.id);

    // Get total lessons count using the section IDs array
    const { count: totalLessons, error: countError } = await supabase
      .from('course_lessons')
      .select('*', { count: 'exact', head: true })
      .in('section_id', sectionIds);
    
    if (countError) throw countError;

    // Get lessons from course sections to form an array of lesson IDs
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('course_lessons')
      .select('id')
      .in('section_id', sectionIds);
      
    if (lessonsError) throw lessonsError;
    
    // Extract lesson IDs into an array
    const lessonIds = lessonsData.map(lesson => lesson.id);

    // Get completed lessons count using the lesson IDs array
    const { count: completedLessons, error: completedError } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true)
      .in('lesson_id', lessonIds);
    
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
    
    // Extract course data from the result and return as Course[]
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
    
    // Extract course data with progress and return
    return data && data.length > 0
      ? data.map(item => ({
          ...((item.courses || {}) as unknown as Course),
          progress: item.progress_percentage
        }))
      : [];
  }
};
