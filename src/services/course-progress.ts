
// DEPRECATED: Este archivo está obsoleto - usar src/services/course-progress/index.ts en su lugar
// Mantenido temporalmente para asegurar compatibilidad con cualquier componente antiguo que aún lo utilice

import { 
  fetchUserProgressData,
  markLessonComplete,
  saveQuizResults,
  updateCourseProgressData
} from './course-progress/index';

// Re-export functions for backward compatibility
export { 
  fetchUserProgressData,
  markLessonComplete, 
  saveQuizResults,
  updateCourseProgressData 
};

// Re-export types for backward compatibility
export type { 
  ProgressResult, 
  CompletedLessonsMap,
  CompletedQuizzesMap,
  LessonProgressItem,
  CourseProgressItem,
  LessonProgressResponse,
  TotalLessonsResponse,
  SupabaseSimpleResponse,
  QuizResult
} from './course-progress/types';
