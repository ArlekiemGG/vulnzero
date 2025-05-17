
import { courseInfoService } from './course-info-service';
import { lessonProgressService } from './lesson-progress-service';
import { progressDataService } from './progress-data-service';
import { courseProgressUpdater } from './course-progress-updater';

/**
 * Service centralizado para gestionar el progreso de cursos y lecciones
 */
export const courseProgressService = {
  // Course information
  getLessonCourseInfo: courseInfoService.getLessonCourseInfo,
  getCourseProgress: courseInfoService.getCourseProgress,

  // User progress data
  fetchUserProgressData: progressDataService.fetchUserProgressData,
  fetchLessonProgressByLessonId: lessonProgressService.fetchLessonProgressByLessonId,

  // Progress updates
  markLessonComplete: lessonProgressService.markLessonComplete,
  saveQuizResults: lessonProgressService.saveQuizResults,
  updateCourseProgressData: courseProgressUpdater.updateCourseProgressData
};
