
// Main module for course progress functionality
// Exports all necessary functions and types from submodules

import { fetchUserProgressData } from './user-data';
import { markLessonComplete, saveQuizResults } from './lesson-progress';
import { updateCourseProgressData } from './course-progress';

// Export main functions
export {
  fetchUserProgressData,
  markLessonComplete,
  saveQuizResults,
  updateCourseProgressData
};

// Re-export types
export * from './types';
