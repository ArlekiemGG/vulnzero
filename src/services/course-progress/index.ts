
// Re-exportamos desde nuestro nuevo servicio centralizado 
// para mantener compatibilidad con código existente

import { courseProgressService } from '@/services/course-progress-service';

// Exportar las funciones principales
export const fetchUserProgressData = (courseId: string, userId: string) => 
  courseProgressService.fetchUserProgressData(courseId, userId);

export const markLessonComplete = (userId: string, courseId: string, lessonId: string) => 
  courseProgressService.markLessonComplete(userId, courseId, lessonId);

export const saveQuizResults = (userId: string, courseId: string, lessonId: string, score: number, answers: Record<string, number>) => 
  courseProgressService.saveQuizResults(userId, courseId, lessonId, score, answers);

export const updateCourseProgressData = (userId: string, courseId: string) => 
  courseProgressService.updateCourseProgressData(userId, courseId);

// Re-exportar tipos
export * from '@/types/course-progress';
