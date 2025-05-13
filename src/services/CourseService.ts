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
      const { data: existingCourses, count, error: countError } = await supabase
        .from('courses')
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (countError) {
        console.error('Error fetching courses:', countError);
        throw countError;
      }
      
      // Si ya existen cursos, no hacemos nada
      if (count && count > 0) {
        console.log(`Found ${count} existing courses`);
        return false;
      }

      console.log('No courses found or error occurred, attempting to seed courses...');
      
      // Si no hay cursos, intentamos crearlos uno por uno para identificar el problema
      for (const course of courseData) {
        try {
          const { data, error } = await supabase
            .from('courses')
            .insert(course)
            .select();
            
          if (error) {
            console.error('Error inserting course:', course.title, error);
            // Continue trying with other courses
          } else {
            console.log(`Successfully inserted course: ${course.title}`);
            
            // For each successful course, create some sample sections
            const courseId = data[0].id;
            const sectionCount = Math.floor(Math.random() * 3) + 3; // 3-5 sections
            
            for (let i = 1; i <= sectionCount; i++) {
              try {
                const sectionData = {
                  course_id: courseId,
                  title: `Módulo ${i}: ${this.getSectionTitle(course.title, i)}`,
                  position: i
                };
                
                const { data: sectionResult, error: sectionError } = await supabase
                  .from('course_sections')
                  .insert(sectionData)
                  .select();
                
                if (sectionError) {
                  console.error('Error creating section:', sectionError);
                } else {
                  const sectionId = sectionResult[0].id;
                  const lessonCount = Math.floor(Math.random() * 5) + 3; // 3-7 lessons
                  
                  // Create lessons for each section
                  for (let j = 1; j <= lessonCount; j++) {
                    const lessonData = {
                      section_id: sectionId,
                      title: `Lección ${j}: ${this.getLessonTitle(sectionData.title, j)}`,
                      content: this.getLessonContent(sectionData.title, j),
                      duration_minutes: Math.floor(Math.random() * 25) + 15, // 15-40 minutes
                      position: j,
                      video_url: Math.random() > 0.5 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null
                    };
                    
                    const { error: lessonError } = await supabase
                      .from('course_lessons')
                      .insert(lessonData);
                    
                    if (lessonError) {
                      console.error('Error creating lesson:', lessonError);
                    }
                  }
                }
              } catch (err) {
                console.error('Error in section/lesson creation:', err);
              }
            }
          }
        } catch (err) {
          console.error('Error processing course:', err);
        }
      }
      
      // Check if we successfully created any courses
      const { count: newCount, error: newCountError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });
      
      if (newCountError) throw newCountError;
      
      if (newCount && newCount > 0) {
        console.log(`Successfully seeded ${newCount} courses`);
        return true;
      } else {
        console.log('No courses were successfully seeded');
        return false;
      }
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
    
    if (sectionTitle.includes('Metodología')) {
      const methodLessons = [
        'Marco de trabajo para pruebas de penetración',
        'Gestión de vulnerabilidades',
        'Documentación y reportes',
        'Comunicación efectiva',
        'Automatización de procesos',
        'Integración en ciclos DevSecOps'
      ];
      return methodLessons[lessonNumber - 1] || `Metodología avanzada ${lessonNumber}`;
    }

    if (sectionTitle.includes('Casos Prácticos')) {
      const caseLessons = [
        'Análisis de incidentes reales',
        'Identificación de patrones de ataque',
        'Respuesta a incidentes',
        'Mitigación de vulnerabilidades',
        'Prevención y hardening',
        'Lecciones aprendidas'
      ];
      return caseLessons[lessonNumber - 1] || `Caso práctico ${lessonNumber}`;
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
  `,
  
  // Get all courses
  async getCourses(): Promise<Course[]> {
    try {
      // Attempt to create courses if none exist
      await this.ensureCoursesExist();

      // Try to fetch courses
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
    
      if (error) throw error;

      // If still no courses, create mock courses for display
      if (!data || data.length === 0) {
        console.log('No courses found in database, creating mock courses for display');
        return courseData.map((course, index) => ({
          id: `mock-${index}`,
          ...course,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })) as Course[];
      }
      
      return data as Course[];
    } catch (error) {
      console.error('Error getting courses:', error);
      // Return mock courses as fallback
      return courseData.map((course, index) => ({
        id: `mock-${index}`,
        ...course,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) as Course[];
    }
  },

  // Get a course by ID
  async getCourseById(courseId: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error) throw error;
    return (data as unknown) as Course;
  },

  // Get course sections
  async getCourseSections(courseId: string): Promise<CourseSection[]> {
    const { data, error } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    return (data as unknown) as CourseSection[] || [];
  },

  // Get section lessons
  async getSectionLessons(sectionId: string): Promise<CourseLesson[]> {
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('section_id', sectionId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    return (data as unknown) as CourseLesson[] || [];
  },

  // Get a lesson by ID
  async getLessonById(lessonId: string): Promise<CourseLesson | null> {
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('id', lessonId)
      .single();
    
    if (error) throw error;
    return (data as unknown) as CourseLesson;
  },
  
  // Get course progress for a user
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

  // Update course progress
  async updateCourseProgress(
    userId: string, 
    courseId: string, 
    lessonId: string | null = null, 
    percentage: number = 0
  ): Promise<void> {
    // Verify if there is already a progress record
    const { data: existingProgress } = await supabase
      .from('user_course_progress')
      .select('*') // Changed from just 'id' to '*' to get all fields including last_lesson_id
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existingProgress) {
      // Update existing progress
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
      // Create new progress record
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

  // Mark a lesson as completed
  async markLessonCompleted(userId: string, lessonId: string): Promise<void> {
    // Verify if there is already a progress record for this lesson
    const { data: existingProgress } = await supabase
      .from('user_lesson_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (existingProgress) {
      // Update existing progress
      const { error } = await supabase
        .from('user_lesson_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id);
      
      if (error) throw error;
    } else {
      // Create new progress record
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

    // Update the course progress
    await this.recalculateCourseProgress(userId, lessonId);
  },

  // Get the progress of a lesson for a user
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

  // Recalculate the course progress
  async recalculateCourseProgress(userId: string, lessonId: string): Promise<void> {
    // First, get the lesson to find the section and course
    const { data: lessonData, error: lessonError } = await supabase
      .from('course_lessons')
      .select('section_id')
      .eq('id', lessonId)
      .single();
    
    if (lessonError) throw lessonError;

    // Get the section to find the course
    const { data: sectionData, error: sectionError } = await supabase
      .from('course_sections')
      .select('course_id')
      .eq('id', lessonData.section_id)
      .single();
    
    if (sectionError) throw sectionError;

    const courseId = sectionData.course_id;

    // Get all sections of the course
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

    // Calculate progress percentage
    const percentage = totalLessons && totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Update the course progress
    await this.updateCourseProgress(userId, courseId, lessonId, percentage);
  },

  // Get courses completed by the user
  async getCompletedCourses(userId: string): Promise<Course[]> {
    try {
      if (!userId) return [];
      
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
    } catch (error) {
      console.error('Error getting completed courses:', error);
      return [];
    }
  },

  // Get courses in progress by the user
  async getInProgressCourses(userId: string): Promise<(Course & { progress: number })[]> {
    try {
      if (!userId) return [];
      
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
    } catch (error) {
      console.error('Error getting in-progress courses:', error);
      return [];
    }
  }
};
