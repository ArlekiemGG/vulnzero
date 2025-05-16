
// Importar y reexportar todas las funciones desde los módulos específicos
import { fetchUserProgressData } from './user-data';
import { markLessonComplete, saveQuizResults } from './lesson-progress';
import { updateCourseProgressData } from './course-progress';

// Exportar funciones principales
export {
  fetchUserProgressData,
  markLessonComplete,
  saveQuizResults,
  updateCourseProgressData
};

// Re-exportar los tipos para facilitar su uso
export * from './types';
