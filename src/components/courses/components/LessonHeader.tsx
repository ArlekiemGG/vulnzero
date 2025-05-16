
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LessonHeaderProps {
  courseId: string;
  courseTitle?: string;
}

const LessonHeader = ({ courseId, courseTitle }: LessonHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-6 border-b pb-3">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/courses/${courseId}`)}
          className="p-0 hover:bg-transparent hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Volver al curso{courseTitle ? `: ${courseTitle}` : ''}</span>
        </Button>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => navigate('/courses')}
      >
        <Home className="h-4 w-4 mr-1" />
        <span>Todos los cursos</span>
      </Button>
    </div>
  );
};

export default LessonHeader;
