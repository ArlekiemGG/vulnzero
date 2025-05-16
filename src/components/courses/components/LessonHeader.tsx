
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LessonHeaderProps {
  courseId: string;
}

const LessonHeader = ({ courseId }: LessonHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center mb-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate(`/courses/${courseId}`)}
        className="p-0 hover:bg-transparent hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span>Volver al curso</span>
      </Button>
    </div>
  );
};

export default LessonHeader;
