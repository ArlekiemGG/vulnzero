import { StaticCourseContent, StaticSection, StaticLesson } from '../types';

// Mapeo de IDs de cursos a sus archivos de contenido
const courseContentMap: Record<string, StaticCourseContent> = {
  'course-1': {
    id: 'course-1',
    title: 'Introducción a la Ciberseguridad',
    sections: [
      {
        id: 'section-1-1',
        title: 'Fundamentos de Seguridad',
        lessons: [
          {
            id: 'lesson-1-1-1',
            title: 'Principios básicos de la seguridad informática',
            content: `
# Principios básicos de la seguridad informática

La seguridad informática se basa en tres principios fundamentales:

## Confidencialidad
La información solo debe ser accesible para las personas autorizadas.

## Integridad
La información debe mantenerse precisa y completa, sin modificaciones no autorizadas.

## Disponibilidad
La información debe estar disponible para los usuarios autorizados cuando la necesiten.

Estos tres principios forman el modelo CIA (Confidentiality, Integrity, Availability), que es la base de la seguridad informática moderna.
            `,
            duration_minutes: 15
          },
          {
            id: 'lesson-1-1-2',
            title: 'Tipos de amenazas informáticas',
            content: `
# Tipos de amenazas informáticas

Las amenazas informáticas pueden clasificarse en varias categorías:

## Malware
- Virus
- Troyanos
- Ransomware
- Spyware
- Adware

## Ataques de red
- Denegación de servicio (DoS)
- Ataques de intermediario (MitM)
- Ataques de inyección SQL
- Cross-Site Scripting (XSS)

## Ingeniería social
- Phishing
- Pretexting
- Baiting
- Quid pro quo

Comprender estos tipos de amenazas es fundamental para desarrollar estrategias de defensa efectivas.
            `,
            duration_minutes: 20
          }
        ]
      },
      {
        id: 'section-1-2',
        title: 'Seguridad en la Web',
        lessons: [
          {
            id: 'lesson-1-2-1',
            title: 'Vulnerabilidades web comunes',
            content: `
# Vulnerabilidades web comunes

Las aplicaciones web están expuestas a numerosas vulnerabilidades:

## Inyección SQL
Ocurre cuando un atacante puede insertar código SQL malicioso en consultas que la aplicación envía a la base de datos.

## Cross-Site Scripting (XSS)
Permite a los atacantes inyectar scripts del lado del cliente en páginas web vistas por otros usuarios.

## Cross-Site Request Forgery (CSRF)
Fuerza a un usuario final a ejecutar acciones no deseadas en una aplicación web en la que está actualmente autenticado.

## Exposición de datos sensibles
Ocurre cuando una aplicación no protege adecuadamente datos sensibles como contraseñas, información financiera o datos personales.

## Configuración incorrecta de seguridad
Incluye configuraciones por defecto inseguras, directorios abiertos, mensajes de error que revelan demasiada información, etc.
            `,
            duration_minutes: 25
          }
        ]
      }
    ]
  },
  'course-2': {
    id: 'course-2',
    title: 'Hacking Ético',
    sections: [
      {
        id: 'section-2-1',
        title: 'Fundamentos del Hacking Ético',
        lessons: [
          {
            id: 'lesson-2-1-1',
            title: '¿Qué es el hacking ético?',
            content: `
# ¿Qué es el hacking ético?

El hacking ético es el proceso de penetrar en sistemas informáticos y redes para identificar posibles amenazas y vulnerabilidades. A diferencia del hacking malicioso, esta práctica se realiza con el permiso explícito del propietario del sistema.

## Objetivos del hacking ético
- Identificar vulnerabilidades antes que los atacantes maliciosos
- Mejorar la seguridad de los sistemas informáticos
- Prevenir brechas de seguridad
- Proteger datos sensibles

## Tipos de pruebas de penetración
1. **Pruebas de caja negra**: El hacker no tiene conocimiento previo del sistema
2. **Pruebas de caja blanca**: El hacker tiene conocimiento completo del sistema
3. **Pruebas de caja gris**: El hacker tiene conocimiento parcial del sistema

El hacking ético requiere un profundo conocimiento técnico y un fuerte código ético para asegurar que las actividades realizadas no crucen líneas legales o morales.
            `,
            duration_minutes: 20
          }
        ]
      }
    ]
  }
};

// Función para normalizar IDs
const normalizeId = (id: string): string => {
  return id.replace(/-/g, '').toLowerCase();
};

// Creamos un mapa de IDs normalizados para buscar cursos de manera más flexible
const createNormalizedIdMap = (): Record<string, string> => {
  const normalizedMap: Record<string, string> = {};
  
  Object.keys(courseContentMap).forEach(courseId => {
    const normalizedId = normalizeId(courseId);
    normalizedMap[normalizedId] = courseId;
  });
  
  return normalizedMap;
};

const normalizedIdMap = createNormalizedIdMap();

// Servicio para gestionar el contenido estático de los cursos
export const StaticContentService = {
  /**
   * Obtiene el contenido estático de un curso
   * @param courseId ID del curso
   * @returns Contenido estático del curso o null si no existe
   */
  getCourseContent: (courseId: string): StaticCourseContent | null => {
    if (!courseId) {
      console.error('Error: courseId es undefined o null');
      return null;
    }
    
    console.log(`StaticContentService: Buscando curso con ID: "${courseId}"`);
    
    // Comprobamos si el courseId existe exactamente como está
    if (courseContentMap[courseId]) {
      console.log(`StaticContentService: Curso encontrado con ID exacto: ${courseId}`);
      return courseContentMap[courseId];
    }
    
    // Si no se encontró, intentamos buscar de forma más flexible
    const courseIds = Object.keys(courseContentMap);
    const matchedId = courseIds.find(id => id.toLowerCase() === courseId.toLowerCase());
    
    if (matchedId) {
      console.log(`StaticContentService: Curso encontrado con coincidencia flexible: ${matchedId} para búsqueda: ${courseId}`);
      return courseContentMap[matchedId];
    }
    
    // Si sigue sin encontrarse, mostramos todos los IDs disponibles para depuración
    console.error(`StaticContentService: Curso no encontrado con ID: "${courseId}". IDs disponibles: ${courseIds.join(', ')}`);
    return null;
  },

  /**
   * Busca un curso por su ID normalizado
   * @param normalizedId ID del curso normalizado (sin guiones, todo en minúsculas)
   * @returns Contenido estático del curso o null si no existe
   */
  findCourseByNormalizedId: (normalizedId: string): StaticCourseContent | null => {
    const originalId = normalizedIdMap[normalizedId];
    
    if (originalId) {
      console.log(`StaticContentService: Curso encontrado con ID normalizado: ${normalizedId} -> ${originalId}`);
      return courseContentMap[originalId];
    }
    
    console.error(`StaticContentService: Curso no encontrado con ID normalizado: "${normalizedId}". IDs normalizados disponibles: ${Object.keys(normalizedIdMap).join(', ')}`);
    return null;
  },

  /**
   * Obtiene el contenido estático de una lección
   * @param courseId ID del curso
   * @param lessonId ID de la lección
   * @returns Contenido estático de la lección o null si no existe
   */
  getLessonContent: (courseId: string, lessonId: string): StaticLesson | null => {
    const course = StaticContentService.getCourseContent(courseId);
    if (!course) {
      console.error(`No se pudo obtener la lección porque el curso ${courseId} no existe`);
      return null;
    }

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (lesson.id === lessonId) {
          return lesson;
        }
      }
    }

    console.error(`Lección ${lessonId} no encontrada en curso ${courseId}`);
    return null;
  },

  /**
   * Obtiene todas las lecciones de una sección
   * @param courseId ID del curso
   * @param sectionId ID de la sección
   * @returns Lista de lecciones o array vacío si la sección no existe
   */
  getSectionLessons: (courseId: string, sectionId: string): StaticLesson[] => {
    const course = StaticContentService.getCourseContent(courseId);
    if (!course) return [];

    const section = course.sections.find(s => s.id === sectionId);
    return section ? section.lessons : [];
  },

  /**
   * Obtiene todas las secciones de un curso
   * @param courseId ID del curso
   * @returns Lista de secciones o array vacío si el curso no existe
   */
  getCourseSections: (courseId: string): StaticSection[] => {
    const course = StaticContentService.getCourseContent(courseId);
    return course ? course.sections : [];
  },

  /**
   * Obtiene lista de todos los cursos disponibles
   * @returns Lista de cursos estáticos disponibles
   */
  getAllCourses: (): { id: string; title: string }[] => {
    return Object.values(courseContentMap).map(course => ({
      id: course.id,
      title: course.title
    }));
  }
};
