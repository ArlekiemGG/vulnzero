
import { BookOpen, Clock } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface LessonContentProps {
  lesson: {
    title: string;
    content: string;
    duration_minutes: number;
  };
}

const LessonContent = ({ lesson }: LessonContentProps) => {
  return (
    <div className="lesson-content">
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
      
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        <div className="flex items-center">
          <Clock className="mr-1 h-4 w-4" />
          <span>{lesson.duration_minutes} minutos de lectura</span>
        </div>
        <div className="flex items-center">
          <BookOpen className="mr-1 h-4 w-4" />
          <span>Lección</span>
        </div>
      </div>
      
      <div className="prose max-w-none dark:prose-invert mb-8">
        <MarkdownRenderer content={lesson.content} />
      </div>
    </div>
  );
};

export default LessonContent;
