
// DEPRECATED: Este archivo está obsoleto - usar src/services/course-progress/index.ts en su lugar
// Mantenido temporalmente para asegurar compatibilidad con cualquier componente antiguo que aún lo utilice

import { 
  fetchUserProgressData,
  markLessonComplete,
  saveQuizResults,
  updateCourseProgressData
} from './course-progress/index';

// Re-exportamos las funciones para mantener compatibilidad
export { 
  fetchUserProgressData,
  markLessonComplete, 
  saveQuizResults,
  updateCourseProgressData 
};

// También re-exportamos los tipos para mantener compatibilidad
export type { 
  ProgressResult, 
  QuizResult,
  LessonProgressItem,
  CourseProgressItem,
  LessonProgressResponse,
  TotalLessonsResponse,
  SupabaseSimpleResponse
} from './course-progress/types';
