
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
