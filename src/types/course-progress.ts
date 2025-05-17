
export type CompletedLessonsMap = Record<string, boolean>;
export type CompletedQuizzesMap = Record<string, boolean>;

export interface ProgressResult {
  progress: number;
  completedLessons: CompletedLessonsMap;
  completedQuizzes: CompletedQuizzesMap;
}

export interface CourseProgressHook {
  progress: number;
  completedLessons: CompletedLessonsMap;
  completedQuizzes: CompletedQuizzesMap;
  isLoading: boolean;
  error: Error | null;
  markLessonAsCompleted: (moduleId: string, lessonId: string) => Promise<boolean>;
  saveQuizResult: (moduleId: string, lessonId: string, score: number, answers: Record<string, number>) => Promise<boolean>;
  refreshProgress: () => Promise<void>;
}

// Tipos utilizados para la interacción con la base de datos
export interface LessonProgressItem {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  completed_at: string | null;
  quiz_score?: number;
  quiz_answers?: Record<string, number>;
}

export interface CourseProgressItem {
  id?: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  started_at: string;
  completed: boolean;
  completed_at: string | null;
  last_lesson_id?: string | null;
}

export interface LessonProgressResponse {
  data: SimpleLessonProgress[] | null;
  error: any;
}

export interface SimpleLessonProgress {
  lesson_id: string;
  completed: boolean;
  course_id: string;
  quiz_score?: number;
  quiz_answers?: Record<string, number>;
}

export interface TotalLessonsResponse {
  count: number;
  data?: any;
  error: any;
}

export interface SupabaseSimpleResponse {
  data: any;
  error: any;
}

export interface QuizResult {
  score: number;
  answers: Record<string, number>;
}

export interface ProfileWithPreferences {
  id: string;
  username: string;
  avatar_url: string;
  preferred_level?: string;
  recommended_course?: boolean;
  completed_assessment?: boolean;
}
