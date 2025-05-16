
import { CourseMetadata } from '../../components/courses/types';

// Course structure definition
export const courseCatalog: CourseMetadata[] = [
  {
    id: 'fundamentos-cybersecurity',
    title: 'Fundamentos de Ciberseguridad',
    description: 'Este curso introductorio te enseñará los conceptos básicos y fundamentales de la ciberseguridad, desde la seguridad de redes hasta los principios de hacking ético.',
    image_url: '/courses/fundamentos-cybersecurity/cover.jpg',
    category: 'Principiante',
    level: 'básico',
    instructor: 'Alejandro Martínez',
    duration_minutes: 360,
    modules: [
      {
        id: 'introduccion-cybersecurity',
        title: 'Introducción a la Ciberseguridad',
        position: 0,
        lessons: [
          {
            id: 'que-es-ciberseguridad',
            title: '¿Qué es la Ciberseguridad?',
            duration_minutes: 20,
            has_quiz: true
          },
          {
            id: 'amenazas-comunes',
            title: 'Amenazas Comunes en Ciberseguridad',
            duration_minutes: 25,
            has_quiz: true
          },
          {
            id: 'modelos-seguridad',
            title: 'Modelos de Seguridad',
            duration_minutes: 30,
            has_quiz: true
          }
        ]
      },
      {
        id: 'seguridad-redes',
        title: 'Seguridad en Redes',
        position: 1,
        lessons: [
          {
            id: 'fundamentos-redes',
            title: 'Fundamentos de Redes',
            duration_minutes: 35,
            has_quiz: true
          },
          {
            id: 'protocolos-seguros',
            title: 'Protocolos Seguros',
            duration_minutes: 30,
            has_quiz: true
          },
          {
            id: 'firewalls',
            title: 'Firewalls y Sistemas de Detección',
            duration_minutes: 40,
            has_quiz: true
          }
        ]
      }
    ]
  },
  {
    id: 'hacking-etico',
    title: 'Hacking Ético',
    description: 'Aprende las técnicas y metodologías utilizadas por los profesionales de la seguridad para identificar y corregir vulnerabilidades en sistemas informáticos.',
    image_url: '/courses/hacking-etico/cover.jpg',
    category: 'Intermedio',
    level: 'intermedio',
    instructor: 'Marta Rodríguez',
    duration_minutes: 480,
    modules: [
      {
        id: 'reconocimiento',
        title: 'Fase de Reconocimiento',
        position: 0,
        lessons: [
          {
            id: 'osint',
            title: 'OSINT: Inteligencia de Fuentes Abiertas',
            duration_minutes: 40,
            has_quiz: true
          },
          {
            id: 'footprinting',
            title: 'Footprinting y Fingerprinting',
            duration_minutes: 35,
            has_quiz: true
          },
          {
            id: 'escaneo-redes',
            title: 'Escaneo de Redes',
            duration_minutes: 45,
            has_quiz: true
          }
        ]
      },
      {
        id: 'explotacion',
        title: 'Fase de Explotación',
        position: 1,
        lessons: [
          {
            id: 'vulnerabilidades-web',
            title: 'Vulnerabilidades Web Comunes',
            duration_minutes: 50,
            has_quiz: true
          },
          {
            id: 'metasploit',
            title: 'Introducción a Metasploit',
            duration_minutes: 60,
            has_quiz: true
          },
          {
            id: 'post-explotacion',
            title: 'Técnicas de Post-Explotación',
            duration_minutes: 55,
            has_quiz: true
          }
        ]
      }
    ]
  },
  {
    id: 'analisis-malware',
    title: 'Análisis de Malware',
    description: 'Un curso avanzado que te enseñará las técnicas y herramientas para analizar y comprender el funcionamiento del software malicioso.',
    image_url: '/courses/analisis-malware/cover.jpg',
    category: 'Avanzado',
    level: 'avanzado',
    instructor: 'Carlos Vega',
    duration_minutes: 540,
    modules: [
      {
        id: 'fundamentos-malware',
        title: 'Fundamentos del Malware',
        position: 0,
        lessons: [
          {
            id: 'tipos-malware',
            title: 'Tipos y Clasificación de Malware',
            duration_minutes: 40,
            has_quiz: true
          },
          {
            id: 'vectores-infeccion',
            title: 'Vectores de Infección',
            duration_minutes: 35,
            has_quiz: true
          },
          {
            id: 'ciclo-vida-malware',
            title: 'Ciclo de Vida del Malware',
            duration_minutes: 30,
            has_quiz: true
          }
        ]
      },
      {
        id: 'analisis-estatico',
        title: 'Análisis Estático',
        position: 1,
        lessons: [
          {
            id: 'herramientas-analisis',
            title: 'Herramientas de Análisis Estático',
            duration_minutes: 45,
            has_quiz: true
          },
          {
            id: 'reversing-basico',
            title: 'Ingeniería Inversa Básica',
            duration_minutes: 60,
            has_quiz: true
          },
          {
            id: 'analisis-codigo',
            title: 'Análisis de Código Malicioso',
            duration_minutes: 50,
            has_quiz: true
          }
        ]
      }
    ]
  }
];

// Helper function to find a course by its ID
export const findCourseById = (courseId: string): CourseMetadata | undefined => {
  return courseCatalog.find(course => course.id === courseId);
};

// Helper function to find a module within a course
export const findModuleById = (courseId: string, moduleId: string) => {
  const course = findCourseById(courseId);
  if (!course) return undefined;
  
  return course.modules.find(module => module.id === moduleId);
};

// Helper function to find a lesson within a course and module
export const findLessonById = (courseId: string, moduleId: string, lessonId: string) => {
  const module = findModuleById(courseId, moduleId);
  if (!module) return undefined;
  
  return module.lessons.find(lesson => lesson.id === lessonId);
};

// Export for easy access to all courses
export default courseCatalog;
