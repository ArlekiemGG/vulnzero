
import { BookOpen } from 'lucide-react';
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
    <>
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
      
      <div className="flex items-center text-sm text-gray-500 mb-8">
        <BookOpen className="mr-1 h-4 w-4" />
        <span>{lesson.duration_minutes} minutos de lectura</span>
      </div>
      
      <div className="prose max-w-none mb-8">
        <MarkdownRenderer content={lesson.content} />
      </div>
    </>
  );
};

export default LessonContent;
