
import { courseProgressService } from './course-progress-service';

// Re-export the main functions and types
export const {
  fetchUserProgressData,
  markLessonComplete,
  saveQuizResults,
  updateCourseProgressData,
  getLessonCourseInfo,
  fetchLessonProgressByLessonId,
  getCourseProgress
} = courseProgressService;

// Re-export types
export * from '@/types/course-progress';
