
import { Course, Lesson, Section } from './services/CourseService';

export interface SectionWithLessons extends Section {
  lessons: Lesson[];
}
