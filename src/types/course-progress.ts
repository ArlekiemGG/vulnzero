
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
