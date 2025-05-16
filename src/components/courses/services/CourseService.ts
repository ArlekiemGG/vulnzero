
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  level: string;
  category: string;
  instructor: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  content: string;
  duration_minutes: number;
  position: number;
  video_url: string | null;
  created_at: string;
  updated_at: string;
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
      console.log('Fetching all courses');
      const { data, error } = await supabase
        .from('courses')
        .select('*');
      
      if (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }
      
      console.log('Courses fetched:', data);
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
  },
  
  async createFundamentalsCourse(): Promise<{success: boolean, courseId?: string}> {
    try {
      console.log("Starting course creation process");
      
      // 1. Create the course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: "Fundamentos de Ciberseguridad",
          description: "Un curso introductorio que cubre los conceptos esenciales de la ciberseguridad, desde amenazas comunes hasta buenas prácticas de seguridad.",
          image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2674&q=80",
          level: "principiante",
          category: "ciberseguridad",
          instructor: "Equipo VulnZero",
          duration_minutes: 180
        })
        .select()
        .single();
      
      if (courseError) {
        console.error("Error creating course:", courseError);
        throw courseError;
      }
      
      if (!courseData) {
        throw new Error("No se pudo crear el curso - no se devolvieron datos");
      }
      
      console.log("Course created successfully:", courseData);
      
      // 2. Create the section
      const { data: sectionData, error: sectionError } = await supabase
        .from('course_sections')
        .insert({
          course_id: courseData.id,
          title: "Módulo: Fundamentos de Ciberseguridad",
          position: 1
        })
        .select()
        .single();
      
      if (sectionError) {
        console.error("Error creating section:", sectionError);
        throw sectionError;
      }
      
      if (!sectionData) {
        throw new Error("No se pudo crear la sección del curso - no se devolvieron datos");
      }
      
      console.log("Section created successfully:", sectionData);
      
      // 3. Create the lessons
      const lessons = [
        {
          section_id: sectionData.id,
          title: "¿Qué es la ciberseguridad?",
          content: `# ¿Qué es la ciberseguridad?

Objetivo: Comprender qué es la ciberseguridad y por qué es importante.

La ciberseguridad es el conjunto de técnicas, procesos y herramientas diseñadas para proteger sistemas informáticos, redes, dispositivos y datos frente a accesos no autorizados, ataques o daños.

🌐 Todo lo que está conectado a internet es vulnerable. Desde un teléfono móvil hasta un servidor corporativo.

## Áreas clave de la ciberseguridad:

- Seguridad de red
- Seguridad de aplicaciones
- Seguridad de la información
- Seguridad operativa
- Recuperación ante desastres

## ¿Por qué importa?
Los ciberataques pueden provocar pérdida de datos, robo de identidad, daños económicos, reputacionales y más. La ciberseguridad protege la confidencialidad, integridad y disponibilidad de la información (el famoso triángulo CIA).`,
          position: 1,
          duration_minutes: 20
        },
        {
          section_id: sectionData.id,
          title: "Tipos de amenazas comunes",
          content: `# Tipos de amenazas comunes

Objetivo: Conocer los tipos de ataques más frecuentes.

## Tipos de amenazas principales:

- **Malware**: software malicioso como virus, troyanos, spyware.
- **Phishing**: intento de engañar al usuario para que revele información confidencial.
- **Ransomware**: secuestra archivos y pide rescate.
- **Ataques de fuerza bruta**: prueban contraseñas hasta encontrar la correcta.
- **Ingeniería social**: manipulación psicológica para obtener acceso.

🔐 La mayoría de ataques exitosos ocurren porque alguien cometió un error humano.`,
          position: 2,
          duration_minutes: 25
        },
        {
          section_id: sectionData.id,
          title: "¿Qué es el hacking ético?",
          content: `# ¿Qué es el hacking ético?

Objetivo: Entender el rol del hacker ético y sus diferencias con un atacante.

El hacking ético (también llamado "pentesting") es el proceso legal y autorizado de evaluar la seguridad de un sistema informático mediante la simulación de ataques reales.

## Tipos de hackers:

- 🟢 **White hat**: Hackers éticos.
- ⚫ **Black hat**: Ciberdelincuentes.
- ⚪ **Gray hat**: Están entre lo legal y lo ilegal.

Los hackers éticos ayudan a prevenir ataques, no a causarlos.`,
          position: 3,
          duration_minutes: 30
        },
        {
          section_id: sectionData.id,
          title: "Conceptos básicos de redes",
          content: `# Conceptos básicos de redes

Objetivo: Familiarizarse con los fundamentos de redes.

## Conceptos esenciales:

- **IP (Internet Protocol)**: Identifica cada dispositivo en una red.
- **DNS**: Traduce nombres de dominio a IPs.
- **Firewall**: Filtra el tráfico de red.
- **Puertos**: "Puertas" por donde se comunican los servicios (ej: puerto 80 para HTTP).
- **Protocolos**: Reglas de comunicación (ej: TCP/IP, HTTP, FTP).

🧪 Saber escanear puertos es una de las primeras habilidades que se aprende en ciberseguridad.`,
          position: 4,
          duration_minutes: 35
        },
        {
          section_id: sectionData.id,
          title: "Introducción a Linux y la línea de comandos",
          content: `# Introducción a Linux y la línea de comandos

Objetivo: Aprender los comandos básicos de Linux, el sistema operativo más usado en hacking ético.

## Comandos esenciales:

- **pwd**: muestra la ruta actual.
- **ls**: lista archivos.
- **cd**: cambia de directorio.
- **mkdir**: crea carpetas.
- **nano**: editor de texto.
- **chmod** y **chown**: administración de permisos.

🐧 Linux es el sistema favorito en ciberseguridad por su control, transparencia y flexibilidad.`,
          position: 5,
          duration_minutes: 40
        },
        {
          section_id: sectionData.id,
          title: "Buenas prácticas de seguridad",
          content: `# Buenas prácticas de seguridad

Objetivo: Conocer hábitos clave para mejorar la seguridad personal y organizacional.

## Prácticas recomendadas:

- Usar contraseñas fuertes (mezcla de mayúsculas, minúsculas, números y símbolos).
- Activar 2FA (doble verificación).
- Mantener software actualizado.
- No hacer clic en enlaces sospechosos.
- Usar VPN en redes públicas.
- Realizar backups regularmente.`,
          position: 6,
          duration_minutes: 30
        }
      ];
      
      for (const lesson of lessons) {
        console.log(`Creating lesson: ${lesson.title}`);
        const { error: lessonError } = await supabase
          .from('course_lessons')
          .insert(lesson);
        
        if (lessonError) {
          console.error(`Error creating lesson "${lesson.title}":`, lessonError);
        } else {
          console.log(`Lesson "${lesson.title}" created successfully`);
        }
      }
      
      return { success: true, courseId: courseData.id };
    } catch (error) {
      console.error("Error al crear el curso:", error);
      return { success: false };
    }
  }
};

