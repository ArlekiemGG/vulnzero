
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface CompletionButtonProps {
  isCompleted: boolean;
  onComplete: () => Promise<void>;
}

const LessonCompletionButton = ({ isCompleted, onComplete }: CompletionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  
  // Update internal state when prop changes
  useEffect(() => {
    console.log("LessonCompletionButton: isCompleted prop changed:", isCompleted);
    setCompleted(isCompleted);
  }, [isCompleted]);
  
  const handleComplete = async () => {
    if (isLoading || completed) return;
    
    console.log("LessonCompletionButton: Starting completion process");
    setIsLoading(true);
    try {
      console.log("LessonCompletionButton: Calling onComplete callback");
      await onComplete();
      console.log("LessonCompletionButton: Completion callback executed successfully");
      setCompleted(true);
      toast({
        title: "Lección completada",
        description: "Se ha guardado tu progreso correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la lección como completada",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("LessonCompletionButton: Completion process finished, completed state:", completed);
    }
  };
  
  return (
    <>
      {completed ? (
        <Button variant="outline" className="flex items-center bg-green-900/20 border-green-500" disabled>
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          <span>Completada</span>
        </Button>
      ) : (
        <Button onClick={handleComplete} disabled={isLoading} className="flex items-center">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          <span>{isLoading ? "Guardando progreso..." : "Marcar como completada"}</span>
        </Button>
      )}
    </>
  );
};

export default LessonCompletionButton;
