
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  courseId: string;
  prevLesson: {id: string; title: string} | null;
  nextLesson: {id: string; title: string} | null;
}

const LessonNavigation = ({ courseId, prevLesson, nextLesson }: NavigationProps) => {
  const navigate = useNavigate();
  
  const navigateToLesson = (id: string) => {
    navigate(`/courses/${courseId}/lessons/${id}`);
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t">
      <div className="mb-4 sm:mb-0">
        {prevLesson && (
          <Button 
            variant="outline" 
            onClick={() => navigateToLesson(prevLesson.id)}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Anterior</span>
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        {nextLesson && (
          <Button 
            onClick={() => navigateToLesson(nextLesson.id)}
            className="flex items-center"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonNavigation;
