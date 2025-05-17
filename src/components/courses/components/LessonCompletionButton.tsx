
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
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
  const [retryCount, setRetryCount] = useState(0);
  const [wasSaved, setWasSaved] = useState(false);
  
  // Update internal state when prop changes
  useEffect(() => {
    console.log("LessonCompletionButton: isCompleted prop changed:", initialCompleted);
    setCompleted(initialCompleted);
    if (initialCompleted) {
      setWasSaved(true);
    }
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
      setWasSaved(true);
      
      toast({
        title: "Lección completada",
        description: "Tu progreso se ha guardado correctamente",
      });
    } catch (error: any) {
      console.error('Error marking lesson as completed:', error);
      
      const errorMessage = error.message || 'No se pudo marcar la lección como completada';
      setError(errorMessage);
      
      // Increment retry count for diagnostics
      setRetryCount(count => count + 1);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If this is a repeated error, provide more detailed guidance
      if (retryCount >= 2) {
        toast({
          title: "Problema persistente",
          description: "Hay un problema técnico guardando tu progreso. Por favor, intenta actualizar la página o contacta soporte.",
          variant: "destructive",
          duration: 6000,
        });
      }
    } finally {
      setIsLoading(false);
      console.log("LessonCompletionButton: Completion process finished, completed state:", completed);
    }
  }, [completed, isLoading, onComplete, retryCount]);
  
  return (
    <div className="flex flex-col items-start">
      {completed ? (
        <div className="space-y-1">
          <Button variant="outline" className="flex items-center bg-green-900/20 border-green-500" disabled>
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span>Completada</span>
          </Button>
          {wasSaved ? (
            <p className="text-green-500 text-xs mt-1 ml-1">Tu progreso ha sido guardado</p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-1">
          <Button 
            onClick={handleComplete} 
            disabled={isLoading} 
            className="flex items-center"
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            <span>{isLoading ? "Guardando progreso..." : "Marcar como completada"}</span>
          </Button>
          
          {error && (
            <div className="flex items-center text-red-500 text-sm mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonCompletionButton;
