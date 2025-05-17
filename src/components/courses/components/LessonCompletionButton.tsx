
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

interface CompletionButtonProps {
  isCompleted: boolean;
  onComplete: () => Promise<void>;
}

const LessonCompletionButton = ({ isCompleted: initialCompleted, onComplete }: CompletionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  
  // Update internal state when prop changes
  useEffect(() => {
    console.log("LessonCompletionButton: isCompleted prop changed:", initialCompleted);
    setCompleted(initialCompleted);
  }, [initialCompleted]);
  
  const handleComplete = useCallback(async () => {
    // Skip if already loading or completed
    if (isLoading || completed) return;
    
    console.log("LessonCompletionButton: Starting completion process");
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("LessonCompletionButton: Calling onComplete callback");
      await onComplete();
      console.log("LessonCompletionButton: Completion callback executed successfully");
      
      // Only update state if we didn't get an exception
      setCompleted(true);
      
      toast({
        title: "Lección completada",
        description: "Tu progreso se ha guardado correctamente",
      });
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      const errorMessage = 'No se pudo marcar la lección como completada';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("LessonCompletionButton: Completion process finished, completed state:", completed);
    }
  }, [completed, isLoading, onComplete]);
  
  return (
    <div className="flex flex-col items-start">
      {completed ? (
        <Button variant="outline" className="flex items-center bg-green-900/20 border-green-500" disabled>
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          <span>Completada</span>
        </Button>
      ) : (
        <Button 
          onClick={handleComplete} 
          disabled={isLoading} 
          className="flex items-center"
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          <span>{isLoading ? "Guardando progreso..." : "Marcar como completada"}</span>
        </Button>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default LessonCompletionButton;
