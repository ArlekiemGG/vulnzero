
// Módulo principal para la funcionalidad de progreso del curso
// Exporta todas las funciones y tipos necesarios de los submódulos

import { fetchUserProgressData } from './user-data';
import { markLessonComplete, saveQuizResults } from './lesson-progress';
import { updateCourseProgressData } from './course-progress';

// Exportar las funciones principales
export {
  fetchUserProgressData,
  markLessonComplete,
  saveQuizResults,
  updateCourseProgressData
};

// Re-exportar tipos
export * from './types';
