
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface CompletionButtonProps {
  isCompleted: boolean;
  onComplete: () => Promise<void>;
}

const LessonCompletionButton = ({ isCompleted, onComplete }: CompletionButtonProps) => {
  return (
    <>
      {isCompleted ? (
        <Button variant="outline" className="flex items-center" disabled>
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          <span>Completada</span>
        </Button>
      ) : (
        <Button onClick={onComplete}>
          Marcar como completada
        </Button>
      )}
    </>
  );
};

export default LessonCompletionButton;
