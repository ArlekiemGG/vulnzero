
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface MachineHint {
  id: number;
  title: string;
  content: string;
  locked: boolean;
}

interface MachineHintsProps {
  hints: MachineHint[];
  onUnlockHint: (hintId: number) => void;
  isLoading: boolean;
}

const MachineHints: React.FC<MachineHintsProps> = ({ hints, onUnlockHint, isLoading }) => {
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
                  <h4 className="font-medium text-cybersec-electricblue">{hint.title}</h4>
                  {hint.locked ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs border-cybersec-yellow text-cybersec-yellow hover:bg-cybersec-yellow/10"
                      onClick={() => onUnlockHint(hint.id)}
                    >
                      Desbloquear (-50 pts)
                    </Button>
                  ) : (
                    <Badge className="bg-green-900/30 text-green-400 border-green-700">Desbloqueado</Badge>
                  )}
                </div>
                {hint.locked ? (
                  <p className="text-sm text-gray-500">Esta pista está bloqueada. Desbloquéala para ver su contenido.</p>
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
  );
};

export default MachineHints;
