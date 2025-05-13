
import { courseData } from '@/data/courseData';
import { supabase } from '@/integrations/supabase/client';

// Utility function to seed course data
export const seedCourses = async () => {
  try {
    console.log('Starting to seed course data...');
    
    // Insert courses - using courseData which now has all required fields
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .insert(courseData)
      .select();
    
    if (coursesError) {
      console.error('Error seeding courses:', coursesError);
      return;
    }
    
    console.log(`Successfully inserted ${coursesData.length} courses`);
    
    // Create sections for each course
    for (const course of coursesData) {
      // Create 3-5 sections per course
      const sectionCount = Math.floor(Math.random() * 3) + 3; // 3-5 sections
      
      const sections = [];
      for (let i = 1; i <= sectionCount; i++) {
        sections.push({
          course_id: course.id,
          title: `Módulo ${i}: ${getSectionTitle(course.title, i)}`,
          position: i
        });
      }
      
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('course_sections')
        .insert(sections)
        .select();
      
      if (sectionsError) {
        console.error(`Error creating sections for course ${course.id}:`, sectionsError);
        continue;
      }
      
      console.log(`Created ${sectionsData.length} sections for course ${course.title}`);
      
      // Create lessons for each section
      for (const section of sectionsData) {
        // Create 3-7 lessons per section
        const lessonCount = Math.floor(Math.random() * 5) + 3; // 3-7 lessons
        
        const lessons = [];
        for (let i = 1; i <= lessonCount; i++) {
          lessons.push({
            section_id: section.id,
            title: `Lección ${i}: ${getLessonTitle(section.title, i)}`,
            content: getLessonContent(section.title, i),
            duration_minutes: Math.floor(Math.random() * 25) + 15, // 15-40 minutes
            position: i,
            video_url: Math.random() > 0.5 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null // 50% chance to have a video
          });
        }
        
        const { error: lessonsError } = await supabase
          .from('course_lessons')
          .insert(lessons);
        
        if (lessonsError) {
          console.error(`Error creating lessons for section ${section.id}:`, lessonsError);
          continue;
        }
      }
    }
    
    console.log('Course seeding completed successfully!');
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
  }
};

// Helper functions to generate titles and content
function getSectionTitle(courseTitle: string, sectionNumber: number): string {
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
}

function getLessonTitle(sectionTitle: string, lessonNumber: number): string {
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
}

function getLessonContent(sectionTitle: string, lessonNumber: number): string {
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
}
