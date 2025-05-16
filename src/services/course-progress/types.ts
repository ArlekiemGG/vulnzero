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
}

export interface LessonProgressItem {
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
}

export interface CourseProgressItem {
  user_id: string;
  course_id: string;
  progress_percentage: number;
  completed: boolean;
  completed_at?: string | null;
  started_at: string;
  last_lesson_id?: string | null;
}

export interface SimpleLessonProgress {
  lesson_id: string;
  completed: boolean;
  course_id: string;
}

export interface SupabaseSimpleResponse {
  data: any;
  error: any;
}

export interface TotalLessonsResponse {
  count: number;
  error: any;
}

export interface LessonProgressResponse {
  data: SimpleLessonProgress[];
  error: any;
}

export interface LearningPathItem {
  id: string;
  title: string;
  description: string;
  level: string;
  course_ids: string[];
  prerequisites: string[];
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  preferred_level?: string;
  recommended_course?: string;
  completed_assessment?: boolean;
  learning_path_id?: string; 
}

export interface QuizResult {
  completed: boolean;
  score: number;
  answers: Record<string, number>;
}

// Ampliación de la interfaz de Profiles para incluir los nuevos campos
export interface ProfileWithPreferences {
  id: string;
  username?: string;
  avatar_url?: string;
  points?: number;
  level?: number;
  solved_machines?: number;
  completed_challenges?: number;
  role?: string;
  rank?: number;
  created_at?: string;
  updated_at?: string;
  preferred_level?: string;
  recommended_course?: string;
  completed_assessment?: boolean;
}
