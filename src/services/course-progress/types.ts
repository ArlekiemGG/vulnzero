
// Interfaces para los modelos de datos
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

// Tipo de retorno para la función fetchUserProgressData
export interface ProgressResult {
  progress: number;
  completedLessons: Record<string, boolean>;
  completedQuizzes: Record<string, boolean>;
}

// Interfaces para las respuestas de Supabase
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

// Tipos adicionales para resolver problemas de inferencia
export interface SimpleLessonProgress {
  lesson_id: string;
  completed: boolean;
  course_id: string;  // Requerido para evitar problemas de tipo
}
