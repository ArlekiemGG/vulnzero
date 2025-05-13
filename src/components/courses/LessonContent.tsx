
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { CourseLesson } from '@/services/CourseService';
import ReactMarkdown from 'react-markdown';
// Import highlight.js directly
import 'highlight.js/styles/github-dark.min.css';

interface LessonContentProps {
  lesson: CourseLesson;
  nextLessonId?: string;
  prevLessonId?: string;
  courseId: string;
  isCompleted: boolean;
  onComplete: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  nextLessonId,
  prevLessonId,
  courseId,
  isCompleted,
  onComplete,
}) => {
  const navigate = useNavigate();

  const handlePrevious = () => {
    if (prevLessonId) {
      navigate(`/tutorials/${courseId}/lesson/${prevLessonId}`);
    }
  };

  const handleNext = () => {
    if (nextLessonId) {
      navigate(`/tutorials/${courseId}/lesson/${nextLessonId}`);
    } else {
      // Si no hay siguiente lección, volver al curso
      navigate(`/tutorials/${courseId}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-cybersec-gray flex justify-between items-center">
        <h2 className="text-xl font-bold text-cybersec-neongreen">{lesson.title}</h2>
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="flex items-center gap-1 text-sm text-green-500">
              <CheckCircle className="h-4 w-4" />
              Completado
            </span>
          ) : (
            <Button
              variant="default"
              className="bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/90"
              onClick={onComplete}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como completado
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="prose prose-invert max-w-none prose-pre:bg-cybersec-black prose-pre:border prose-pre:border-cybersec-gray prose-headings:text-cybersec-neongreen prose-a:text-cybersec-electricblue">
          <ReactMarkdown>
            {lesson.content}
          </ReactMarkdown>
        </div>
      </div>

      <div className="p-4 border-t border-cybersec-gray flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={!prevLessonId}
          className="text-cybersec-electricblue hover:text-cybersec-electricblue hover:bg-cybersec-black/30"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          variant={nextLessonId ? "ghost" : "default"}
          onClick={handleNext}
          className={
            nextLessonId 
              ? "text-cybersec-electricblue hover:text-cybersec-electricblue hover:bg-cybersec-black/30" 
              : "bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/90"
          }
        >
          {nextLessonId ? "Siguiente" : "Finalizar"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default LessonContent;
