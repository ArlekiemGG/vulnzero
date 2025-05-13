
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface MachineHint {
  id: number;
  title: string;
  content: string;
  locked: boolean;
  level: number;
  pointCost: number;
}

interface MachineHintsProps {
  hints: MachineHint[];
  onUnlockHint: (hintId: number, pointCost: number) => Promise<boolean>;
  isLoading: boolean;
  userPoints?: number;
}

const MachineHints: React.FC<MachineHintsProps> = ({ hints, onUnlockHint, isLoading, userPoints = 0 }) => {
  const [confirmHintId, setConfirmHintId] = useState<number | null>(null);
  const [hintCost, setHintCost] = useState<number>(0);
  const [processingHintId, setProcessingHintId] = useState<number | null>(null);

  const handleOpenConfirmation = (hintId: number, cost: number) => {
    setConfirmHintId(hintId);
    setHintCost(cost);
  };

  const handleCloseConfirmation = () => {
    setConfirmHintId(null);
  };

  const handleConfirmUnlock = async () => {
    if (confirmHintId === null) return;
    
    const hintId = confirmHintId;
    const cost = hintCost;
    
    setProcessingHintId(hintId);
    setConfirmHintId(null);
    
    try {
      const success = await onUnlockHint(hintId, cost);
      
      if (success) {
        toast({
          title: "¡Pista desbloqueada!",
          description: `Has gastado ${cost} puntos para desbloquear esta pista.`,
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo desbloquear la pista.",
        variant: "destructive"
      });
    } finally {
      setProcessingHintId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-cybersec-neongreen mb-4 flex justify-between items-center">
            <span>Pistas</span>
            <div className="h-6 w-24 bg-cybersec-black rounded animate-pulse"></div>
          </h3>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-cybersec-black border-cybersec-black">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-5 w-32 bg-cybersec-darkgray rounded animate-pulse"></div>
                    <div className="h-7 w-24 bg-cybersec-darkgray rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-full bg-cybersec-darkgray rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-cybersec-neongreen mb-4 flex justify-between items-center">
            <span>Pistas</span>
            <Badge className="bg-cybersec-electricblue text-cybersec-black">
              {hints.filter(hint => !hint.locked).length}/{hints.length} Disponibles
            </Badge>
          </h3>
          
          <div className="space-y-3">
            {hints.map((hint) => (
              <Card key={hint.id} className={`bg-cybersec-black border-cybersec-black`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-cybersec-electricblue">
                      {hint.title} <span className="text-xs text-gray-500 ml-1">[Nivel {hint.level}: {hint.pointCost} pts]</span>
                    </h4>
                    {hint.locked ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs border-cybersec-yellow text-cybersec-yellow hover:bg-cybersec-yellow/10"
                        onClick={() => handleOpenConfirmation(hint.id, hint.pointCost)}
                        disabled={userPoints < hint.pointCost || processingHintId === hint.id}
                      >
                        {processingHintId === hint.id ? (
                          <span className="flex items-center">
                            <span className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                            Procesando...
                          </span>
                        ) : (
                          `Desbloquear (${hint.pointCost} pts)`
                        )}
                      </Button>
                    ) : (
                      <Badge className="bg-green-900/30 text-green-400 border-green-700">Desbloqueado</Badge>
                    )}
                  </div>
                  {hint.locked ? (
                    <div>
                      {userPoints < hint.pointCost ? (
                        <p className="text-sm text-red-400 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Necesitas {hint.pointCost} puntos para desbloquear esta pista.
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Esta pista está bloqueada. Desbloquéala para ver su contenido.</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300">{hint.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}

            {hints.length === 0 && (
              <div className="text-center p-4 bg-cybersec-black rounded">
                <p className="text-gray-400">No hay pistas disponibles para esta máquina.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmHintId !== null} onOpenChange={handleCloseConfirmation}>
        <AlertDialogContent className="bg-cybersec-darkgray border-cybersec-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cybersec-neongreen">
              Confirmar desbloqueo de pista
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              ¿Estás seguro que deseas gastar <span className="font-medium text-cybersec-yellow">{hintCost} puntos</span> para desbloquear esta pista?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-cybersec-black text-gray-300 hover:bg-cybersec-black/70 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmUnlock}
              className="bg-cybersec-yellow text-black hover:bg-cybersec-yellow/90"
            >
              Desbloquear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MachineHints;
