import { Course, Lesson, Section } from './services/CourseService';

export interface SectionWithLessons extends Section {
  lessons: Lesson[];
}

export interface StaticCourseContent {
  id: string;
  title: string;
  sections: StaticSection[];
}

export interface StaticSection {
  id: string;
  title: string;
  lessons: StaticLesson[];
}

export interface StaticLesson {
  id: string;
  title: string;
  content: string;
  duration_minutes: number;
}

// Add these new types for our file-based course system
export interface CourseMetadata {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  level: string;
  instructor: string;
  duration_minutes: number;
  modules: ModuleMetadata[];
}

export interface ModuleMetadata {
  id: string;
  title: string;
  position: number;
  lessons: LessonMetadata[];
}

export interface LessonMetadata {
  id: string;
  title: string;
  duration_minutes: number;
  has_quiz: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export interface UserProgress {
  completedLessons: Record<string, boolean>;
  quizResults: Record<string, {
    completed: boolean;
    score: number;
    answers: Record<string, number>;
  }>;
}
