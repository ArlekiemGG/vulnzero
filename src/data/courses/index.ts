
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
  },
  {
    id: 'seguridad-personal',
    title: 'Seguridad Personal Digital',
    description: 'Aprende a proteger tu identidad digital, información personal y dispositivos contra las amenazas cibernéticas más comunes. Curso ideal para principiantes que desean mejorar su postura de seguridad personal.',
    image_url: '/courses/seguridad-personal/cover.jpg',
    category: 'Principiante',
    level: 'básico',
    instructor: 'Laura Gómez',
    duration_minutes: 420,
    modules: [
      {
        id: 'fundamentos-seguridad-personal',
        title: 'Fundamentos de Seguridad Personal',
        position: 0,
        lessons: [
          {
            id: 'pilares-seguridad',
            title: 'Los Pilares de la Seguridad Digital Personal',
            duration_minutes: 25,
            has_quiz: true
          },
          {
            id: 'evaluacion-riesgos',
            title: 'Evaluación de Riesgos Personales',
            duration_minutes: 30,
            has_quiz: true
          },
          {
            id: 'huella-digital',
            title: 'Tu Huella Digital e Identidad Online',
            duration_minutes: 35,
            has_quiz: true
          }
        ]
      },
      {
        id: 'contraseñas-autenticacion',
        title: 'Contraseñas y Autenticación',
        position: 1,
        lessons: [
          {
            id: 'contraseñas-seguras',
            title: 'Creación de Contraseñas Seguras',
            duration_minutes: 30,
            has_quiz: true
          },
          {
            id: 'gestores-contraseñas',
            title: 'Gestores de Contraseñas',
            duration_minutes: 40,
            has_quiz: true
          },
          {
            id: 'autenticacion-dos-factores',
            title: 'Autenticación de Dos Factores (2FA)',
            duration_minutes: 35,
            has_quiz: true
          }
        ]
      },
      {
        id: 'navegacion-segura',
        title: 'Navegación Segura',
        position: 2,
        lessons: [
          {
            id: 'phishing-social',
            title: 'Identificando Phishing y Ataques de Ingeniería Social',
            duration_minutes: 45,
            has_quiz: true
          },
          {
            id: 'extensiones-navegador',
            title: 'Extensiones de Seguridad para Navegadores',
            duration_minutes: 30,
            has_quiz: true
          },
          {
            id: 'vpn-proxy',
            title: 'VPNs y Proxies: Protección de tu Tráfico',
            duration_minutes: 40,
            has_quiz: true
          }
        ]
      },
      {
        id: 'dispositivos-moviles',
        title: 'Seguridad en Dispositivos Móviles',
        position: 3,
        lessons: [
          {
            id: 'android-ios-seguridad',
            title: 'Configuraciones de Seguridad en Android e iOS',
            duration_minutes: 35,
            has_quiz: true
          },
          {
            id: 'apps-maliciosas',
            title: 'Identificación de Aplicaciones Maliciosas',
            duration_minutes: 30,
            has_quiz: true
          },
          {
            id: 'conexiones-publicas',
            title: 'Uso Seguro de Redes Wi-Fi Públicas',
            duration_minutes: 35,
            has_quiz: true
          },
          {
            id: 'cifrado-dispositivos',
            title: 'Cifrado de Dispositivos Móviles',
            duration_minutes: 30,
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
