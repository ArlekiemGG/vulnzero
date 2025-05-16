
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CompletionButtonProps {
  isCompleted: boolean;
  onComplete: () => Promise<void>;
}

const LessonCompletionButton = ({ isCompleted, onComplete }: CompletionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleComplete = async () => {
    if (isLoading || isCompleted) return;
    
    setIsLoading(true);
    try {
      await onComplete();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      {isCompleted ? (
        <Button variant="outline" className="flex items-center" disabled>
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          <span>Completada</span>
        </Button>
      ) : (
        <Button onClick={handleComplete} disabled={isLoading} className="flex items-center">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          <span>Marcar como completada</span>
        </Button>
      )}
    </>
  );
};

export default LessonCompletionButton;
