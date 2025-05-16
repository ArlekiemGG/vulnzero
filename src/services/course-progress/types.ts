
// Type definitions for course progress module

// Data model interfaces
export interface LessonProgressItem {
  id?: string;
  lesson_id: string;
  course_id: string;
  user_id: string;
  completed: boolean;
  completed_at?: string;
}

export interface CourseProgressItem {
  id?: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  completed: boolean;
  completed_at?: string | null;
  last_lesson_id?: string | null;
  started_at?: string;
}

export interface QuizResult {
  score: number;
  answers: Record<string, number>;
}

// Return types for functions
export interface ProgressResult {
  progress: number;
  completedLessons: Record<string, boolean>;
  completedQuizzes: Record<string, boolean>;
}

// Database response types
export interface LessonProgressResponse {
  data: SimpleLessonProgress[] | null;
  error: any | null;
}

export interface TotalLessonsResponse {
  count: number;
  error: any | null;
}

export interface SupabaseSimpleResponse {
  data: any;
  error: any | null;
}

// Helper types
export interface SimpleLessonProgress {
  lesson_id: string;
  completed: boolean;
  course_id: string;
}
